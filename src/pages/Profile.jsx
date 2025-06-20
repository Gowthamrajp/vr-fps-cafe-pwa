import { useState, useEffect } from 'preact/hooks';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { route } from 'preact-router';

export default function Profile({ user }) {
  const [profile, setProfile] = useState({
    name: '',
    phoneNumber: '',
    pincode: '',
    school: '',
    college: '',
    referralCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      route('/login');
      return;
    }
    
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(user, { displayName: profile.name });
      await updateDoc(doc(db, 'users', user.uid), profile);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style="max-width: 600px; padding-top: 32px;">
      <div className="card">
        <h2>👤 My Profile</h2>
        
        {message && (
          <div style={`color: ${message.includes('Error') ? 'red' : 'green'}; margin-bottom: 20px;`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={profile.phoneNumber}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                className="form-input"
                value={profile.pincode}
                onChange={(e) => setProfile({...profile, pincode: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">School</label>
              <input
                type="text"
                className="form-input"
                value={profile.school}
                onChange={(e) => setProfile({...profile, school: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">College</label>
              <input
                type="text"
                className="form-input"
                value={profile.college}
                onChange={(e) => setProfile({...profile, college: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">My Referral Code</label>
              <input
                type="text"
                className="form-input"
                value={user.uid.slice(0, 8).toUpperCase()}
                disabled
              />
              <small>Share this code with friends to earn rewards!</small>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
} 