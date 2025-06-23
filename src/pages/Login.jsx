import { useState, useEffect } from 'preact/hooks';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { route } from 'preact-router';

export default function Login() {
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');

  // Initialize reCAPTCHA on component mount
  useEffect(() => {
    // Clean up any existing verifier
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    // Initialize invisible reCAPTCHA
    setupRecaptcha();
    
    return () => {
      // Cleanup on unmount
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          console.log('reCAPTCHA solved automatically');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired, will retry');
          // Auto-retry on expiration
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        },
        'error-callback': (error) => {
          console.log('reCAPTCHA error:', error);
        }
      });
      
      // Render the reCAPTCHA immediately to ensure it's ready
      window.recaptchaVerifier.render().then((widgetId) => {
        console.log('Invisible reCAPTCHA rendered successfully');
      }).catch((error) => {
        console.error('reCAPTCHA render error:', error);
      });
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate phone number (10 digits for India)
      if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
        setError('Please enter a valid 10-digit mobile number');
        setLoading(false);
        return;
      }

      const fullPhoneNumber = `+91${phoneNumber}`;
      
      // Ensure reCAPTCHA is ready
      if (!window.recaptchaVerifier) {
        setupRecaptcha();
      }
      const appVerifier = window.recaptchaVerifier;
      
      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      let errorMessage = 'Failed to send OTP';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (error.code === 'auth/missing-app-credential') {
        errorMessage = 'Authentication service not properly configured.';
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
    setError('');

    try {
      const result = await confirmationResult.confirm(otp);
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create user profile
        const userProfile = {
          id: result.user.uid,
          name: '',
          phone: phoneNumber,
          email: '',
          isGuest: false,
          joinedAt: new Date(),
          totalGamesPlayed: 0,
          totalScore: 0,
          level: 1,
          achievements: [],
    
          referralCode: `FPS${phoneNumber.slice(-4)}${Date.now().toString().slice(-3)}`,
          referredBy: null
        };

        await setDoc(doc(db, 'users', result.user.uid), userProfile);
      }
      
      // Clear reCAPTCHA after successful login
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      
      route('/');
    } catch (error) {
      console.error('OTP verification error:', error);
      if (error.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        setError('OTP has expired. Please request a new one.');
      } else {
        setError('Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setStep('phone');
    setOtp('');
    setError('');
    setConfirmationResult(null);
    
    // Clear reCAPTCHA for resend
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  return (
    <div className="container" style="max-width: 400px; margin-top: 80px;">
      <div className="card">
        <h2 style="text-align: center; margin-bottom: 30px;">🎮 VR FPS Cafe</h2>
        <p style="text-align: center; color: var(--text-secondary); margin-bottom: 30px;">
          Login with your mobile number
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP}>
            <h3>Enter Mobile Number</h3>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="background: var(--background-secondary); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color); font-weight: 500;">+91</span>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength="10"
                  style="flex: 1;"
                  required
                />
              </div>
              <small style="color: var(--text-secondary); font-size: 0.8rem;">
                Enter your 10-digit mobile number
              </small>
            </div>
            
            {error && (
              <div style="color: var(--danger); text-align: center; margin: 15px 0; padding: 10px; background: rgba(220, 53, 69, 0.1); border-radius: 8px; font-size: 0.9rem;">
                {error}
              </div>
            )}
            
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || phoneNumber.length !== 10}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <h3>Enter Verification Code</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
              Enter the 6-digit code sent to +91 {phoneNumber}
            </p>
            
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                style="text-align: center; font-size: 1.2rem; letter-spacing: 0.2rem;"
                required
              />
            </div>
            
            {error && (
              <div style="color: var(--danger); text-align: center; margin: 15px 0; padding: 10px; background: rgba(220, 53, 69, 0.1); border-radius: 8px; font-size: 0.9rem;">
                {error}
              </div>
            )}
            
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-outline btn-full" 
              onClick={resendOTP}
              style="margin-top: 15px;"
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
      
      {/* Invisible reCAPTCHA container - completely hidden but functional */}
      <div 
        id="recaptcha-container" 
        style={{
          position: 'fixed',
          top: '-1000px',
          left: '-1000px',
          width: '1px',
          height: '1px',
          visibility: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1
        }}
      ></div>
    </div>
  );
}