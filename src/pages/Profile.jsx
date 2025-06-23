import { useState, useEffect, useRef } from 'preact/hooks';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../services/firebase';
import { route } from 'preact-router';
import Modal from '../components/Modal';
import TermsContent from '../components/TermsContent';
import PrivacyContent from '../components/PrivacyContent';
import ProfileImage from '../components/ProfileImage';

export default function Profile({ user, isNewUser = false, onProfileComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    acceptTerms: false,
    acceptPrivacy: false,
    profilePicture: null
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingProfile, setExistingProfile] = useState(null);
  const [showNewUserForm, setShowNewUserForm] = useState(isNewUser);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Debug logging for profile picture
  useEffect(() => {
    console.log('Profile page debug:', {
      profilePicturePreview,
      existingProfilePictureURL: existingProfile?.profilePictureURL,
      existingProfile: existingProfile,
      finalSrc: profilePicturePreview || existingProfile?.profilePictureURL
    });
  }, [profilePicturePreview, existingProfile]);

  const loadUserProfile = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setExistingProfile(userData);
        
        // Check if profile is actually complete
        const isProfileComplete = userData.name && 
                                 userData.age && 
                                 userData.gender && 
                                 userData.acceptedTerms && 
                                 userData.acceptedPrivacy;
        
        setFormData({
          name: userData.name || '',
          age: userData.age || '',
          gender: userData.gender || '',
          acceptTerms: userData.acceptedTerms || false,
          acceptPrivacy: userData.acceptedPrivacy || false,
          profilePicture: null
        });
        setProfilePicturePreview(userData.profilePictureURL || '');
        
        // Show new user form if profile is incomplete OR if explicitly marked as new user
        setShowNewUserForm(!isProfileComplete || isNewUser);
      } else {
        // New user - show form
        setShowNewUserForm(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setShowNewUserForm(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear any previous errors
      setError('');
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        e.target.value = ''; // Clear the input
        return;
      }

      setFormData(prev => ({ ...prev, profilePicture: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setProfilePicturePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    if (!file) return null;
    
    const fileName = `profile_pictures/${user.uid}/profile_${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new Error('Failed to upload profile picture');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Starting profile save process...');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Name is required');
        setLoading(false);
        return;
      }

      if (!formData.age || formData.age < 13 || formData.age > 100) {
        setError('Please enter a valid age (13-100)');
        setLoading(false);
        return;
      }

      if (!formData.gender) {
        setError('Please select your gender');
        setLoading(false);
        return;
      }

      if (showNewUserForm && (!formData.acceptTerms || !formData.acceptPrivacy)) {
        setError('Please accept the Terms & Conditions and Privacy Policy');
        setLoading(false);
        return;
      }

      console.log('Validation passed, processing profile picture...');

      // Handle profile picture upload
      let profilePictureURL = existingProfile?.profilePictureURL || '';
      
      if (formData.profilePicture) {
        console.log('Uploading profile picture...');
        try {
          profilePictureURL = await uploadProfilePicture(formData.profilePicture);
          console.log('Profile picture uploaded successfully:', profilePictureURL);
        } catch (uploadError) {
          console.error('Profile picture upload failed:', uploadError);
          // Continue without profile picture if upload fails
          setError('Profile picture upload failed, but profile will be saved without it.');
          profilePictureURL = existingProfile?.profilePictureURL || '';
        }
      }

      console.log('Preparing user data...');

      // Prepare user data - simplified structure for debugging
      const userData = {
        uid: user.uid,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        phoneNumber: user.phoneNumber || '',
        profilePictureURL: profilePictureURL || '',
        acceptedTerms: formData.acceptTerms,
        acceptedPrivacy: formData.acceptPrivacy,
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Initialize stats as separate fields to avoid nested object issues
        kills: existingProfile?.kills || 0,
        deaths: existingProfile?.deaths || 0,
        matches: existingProfile?.matches || 0,
        wins: existingProfile?.wins || 0,
        playTime: existingProfile?.playTime || 0,
        level: existingProfile?.level || 1,
        experience: existingProfile?.experience || 0,
        // Preferences as separate fields
        notifications: existingProfile?.notifications !== undefined ? existingProfile.notifications : true,
        emailUpdates: existingProfile?.emailUpdates !== undefined ? existingProfile.emailUpdates : false
      };

      console.log('User data prepared:', userData);

      // Save to Firestore
      console.log('Saving to Firestore...');
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('Firestore save successful');

      // Update Firebase Auth profile (optional, continue if this fails)
      try {
        console.log('Updating Firebase Auth profile...');
        await updateProfile(auth.currentUser, {
          displayName: formData.name,
          photoURL: profilePictureURL
        });
        console.log('Firebase Auth profile updated');
      } catch (authError) {
        console.error('Firebase Auth profile update failed:', authError);
        // Continue anyway, this is not critical
      }

      console.log('Profile saved successfully');
      
      if (showNewUserForm) {
        console.log('New user registration complete, calling onProfileComplete...');
        // New user registration complete - notify parent to reload profile
        if (onProfileComplete) {
          console.log('Calling onProfileComplete callback...');
          try {
            await onProfileComplete(); // Wait for profile to be reloaded
            console.log('onProfileComplete finished successfully');
          } catch (error) {
            console.error('Error in onProfileComplete:', error);
          }
        }
        
        console.log('Profile completion successful, redirecting to home...');
        // Give more time for state updates and force navigation
        setTimeout(() => {
          console.log('Attempting navigation to home page...');
          route('/', true);
        }, 500);
      } else {
        // Existing user profile updated
        setExistingProfile(userData);
        
        // Update the profile picture preview to show the new image
        if (profilePictureURL) {
          setProfilePicturePreview(profilePictureURL);
          
          // Clear cached profile image to force reload
          const cacheKey = `profile_img_${profilePictureURL}`;
          sessionStorage.removeItem(cacheKey);
          
          // Also clear any old cached versions
          const oldCacheKey = existingProfile?.profilePictureURL ? `profile_img_${existingProfile.profilePictureURL}` : null;
          if (oldCacheKey) {
            sessionStorage.removeItem(oldCacheKey);
          }
        }
        
        // Clear the file input since we've uploaded it
        setFormData(prev => ({ ...prev, profilePicture: null }));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        if (onProfileComplete) {
          onProfileComplete();
        }
        alert('Profile updated successfully!');
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save profile. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your internet connection and try again.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style="text-align: center; margin-top: 100px;">
        <p>Please log in to access your profile.</p>
        <a href="/login" className="btn btn-primary">Go to Login</a>
      </div>
    );
  }

  return (
          <div className="container main-content" style="max-width: 500px; margin-top: 80px;">
      <div className="card">
        <h2 style="text-align: center; margin-bottom: 30px;">
          {showNewUserForm ? '👋 Welcome! Complete Your Profile' : '👤 Edit Profile'}
        </h2>

        {showNewUserForm && (
          <div style="background: var(--primary-color); color: white; padding: 15px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0; font-size: 0.9rem;">
              🎉 <strong>Registration Successful!</strong><br/>
              Please complete your profile to get started with VR gaming.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div className="form-group" style="text-align: center; margin-bottom: 25px;">
            <label className="form-label">Profile Picture (Optional)</label>
            <div style="margin: 15px 0; display: flex; justify-content: center;">
              <ProfileImage 
                src={profilePicturePreview || existingProfile?.profilePictureURL} 
                size="120px"
                fallback="📷"
                className="profile-preview"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style="margin-top: 10px;"
            />
            <small style="display: block; color: var(--text-secondary); margin-top: 5px;">
              Max size: 5MB | Formats: JPG, PNG, GIF
            </small>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Age */}
          <div className="form-group">
            <label className="form-label">Age *</label>
            <input
              type="number"
              name="age"
              className="form-input"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleInputChange}
              min="13"
              max="100"
              required
            />
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <select
              name="gender"
              className="form-select"
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          {/* Terms and Conditions - Only for new users */}
          {showNewUserForm && (
            <>
              <div className="form-group">
                <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer;">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    style="margin-top: 3px;"
                    required
                  />
                  <span style="font-size: 0.9rem; line-height: 1.5;">
                    I accept the <button type="button" onClick={() => setShowTermsModal(true)} style="background: none; border: none; color: var(--primary-color); text-decoration: underline; cursor: pointer; padding: 0; font-size: inherit;">Terms & Conditions</button> *
                  </span>
                </label>
              </div>

              <div className="form-group">
                <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer;">
                  <input
                    type="checkbox"
                    name="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onChange={handleInputChange}
                    style="margin-top: 3px;"
                    required
                  />
                  <span style="font-size: 0.9rem; line-height: 1.5;">
                    I accept the <button type="button" onClick={() => setShowPrivacyModal(true)} style="background: none; border: none; color: var(--primary-color); text-decoration: underline; cursor: pointer; padding: 0; font-size: inherit;">Privacy Policy</button> *
                  </span>
                </label>
              </div>
            </>
          )}

          {error && (
            <div style="color: var(--danger); text-align: center; margin: 15px 0; padding: 10px; background: rgba(220, 53, 69, 0.1); border-radius: 8px;">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading}
            style="margin-top: 25px;"
          >
            {loading ? 'Saving...' : (showNewUserForm ? '🚀 Complete Registration' : '💾 Update Profile')}
          </button>

          {!showNewUserForm && (
            <button 
              type="button" 
              className="btn btn-outline btn-full" 
              onClick={() => route('/')}
              style="margin-top: 15px;"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {showNewUserForm && (
        <div style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
          <small style="color: var(--text-secondary);">
            📞 Verified: {user.phoneNumber}<br/>
            🔒 Your data is secure and encrypted
          </small>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      <Modal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)}
        title="📋 Terms & Conditions"
      >
        <TermsContent />
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)}
        title="🔒 Privacy Policy"
      >
        <PrivacyContent />
      </Modal>
    </div>
  );
} 