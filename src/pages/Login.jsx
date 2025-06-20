import { useState } from 'preact/hooks';
import { signInWithPhoneNumber, RecaptchaVerifier, signInAnonymously } from 'firebase/auth';
import { auth } from '../services/firebase';
import { route } from 'preact-router';

export default function Login() {
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: (response) => {
          // reCAPTCHA solved, allow phone auth
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          // Response expired, ask user to solve reCAPTCHA again
          console.log('reCAPTCHA expired');
        }
      });
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate phone number format
      if (!phoneNumber.startsWith('+')) {
        setError('Phone number must include country code (e.g., +91 for India)');
        setLoading(false);
        return;
      }

      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      let errorMessage = 'Failed to send OTP';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please try again';
      } else if (error.code === 'auth/billing-not-enabled') {
        errorMessage = 'Phone authentication requires Firebase Blaze plan. Please upgrade your Firebase project or use email authentication for testing.';
      }
      
      setError(errorMessage);
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await confirmationResult.confirm(otp);
      route('/');
    } catch (error) {
      setError('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      route('/');
    } catch (error) {
      console.error('Anonymous auth error:', error);
      setError('Anonymous authentication not enabled. Please enable it in Firebase Console or use offline demo mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineDemo = () => {
    // Create a mock user object and store in localStorage for demo
    const mockUser = {
      uid: 'demo-user-123',
      displayName: 'Demo Player',
      phoneNumber: '+91 9876543210'
    };
    
    // Store mock authentication state
    localStorage.setItem('demoUser', JSON.stringify(mockUser));
    
    // Redirect to home page
    route('/');
    
    // Reload to trigger authentication state change
    window.location.reload();
  };

  return (
    <div className="container" style="max-width: 400px; margin-top: 80px;">
      <div className="card">
        <h2 style="text-align: center;">🎮 VR FPS Cafe</h2>

        {step === 'phone' ? (
          <>
            <form onSubmit={handleSendOTP}>
              <h3>Login with Phone</h3>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              
              {error && <div style="color: red; text-align: center;">{error}</div>}
              
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
            
            <div style="margin: 20px 0; text-align: center; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 20px;">
              <strong>For Testing Without Billing Plan</strong>
            </div>
            
            <button 
              type="button" 
              className="btn btn-warning btn-full"
              onClick={handleDemoLogin}
              disabled={loading}
              style="margin-bottom: 12px;"
            >
              {loading ? 'Logging in...' : '🔑 Anonymous Login'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-success btn-full"
              onClick={handleOfflineDemo}
            >
              🚀 Offline Demo Mode
            </button>
            
            <p style="text-align: center; font-size: 0.8rem; color: var(--text-secondary); margin-top: 8px;">
              Phone auth requires Firebase Blaze plan. Try Anonymous Login or Offline Demo.
            </p>
          </>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <h3>Enter OTP</h3>
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            
            {error && <div style="color: red; text-align: center;">{error}</div>}
            
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}
      </div>
      
      <div id="recaptcha-container"></div>
    </div>
  );
} 