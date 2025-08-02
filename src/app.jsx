import { useState, useEffect } from 'preact/hooks';
import Router from 'preact-router';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import Leaderboard from './pages/Leaderboard';
import GameLobby from './pages/GameLobby';
import GameLookup from './pages/GameLookup';
import Stats from './pages/Stats';


export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [forceInstallScreen, setForceInstallScreen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    // Check if app is running as PWA (standalone mode)
    const checkPWAMode = () => {
      // More comprehensive PWA detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://') ||
                          window.matchMedia('(display-mode: minimal-ui)').matches;
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('localhost');
      
      console.log('PWA Mode Check:', {
        isStandalone,
        isMobile,
        isDevelopment,
        userAgent: navigator.userAgent,
        hostname: window.location.hostname
      });
      
      setIsPWA(isStandalone);
      
      // Force install screen for ALL mobile devices (including Android) if not in development
      if (!isStandalone && isMobile && !isDevelopment) {
        console.log('Forcing install screen for mobile device');
        setForceInstallScreen(true);
      } else {
        console.log('Not forcing install screen:', { isStandalone, isMobile, isDevelopment });
        setForceInstallScreen(false);
      }
    };

    checkPWAMode();

    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkPWAMode);

    // Periodic check to ensure install screen stays enforced (every 5 seconds)
    const intervalId = setInterval(checkPWAMode, 5000);

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkPWAMode);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('Before install prompt triggered');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setForceInstallScreen(false);
      setIsPWA(true);
    });

    // Debug logging
    console.log('PWA setup - checking environment:', {
      userAgent: navigator.userAgent,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      navigatorStandalone: window.navigator.standalone,
      hostname: window.location.hostname
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      // Clear any problematic authentication state on Android
      const platform = getPlatform();
      if (platform === 'android') {
        console.log('Android detected, performing aggressive auth cleanup');
        
        // Clear any problematic auth sessions on Android
        const clearAuthState = async () => {
          try {
            // Force sign out any existing user on Android startup
            if (auth.currentUser) {
              console.log('Found existing user on Android startup:', {
                uid: auth.currentUser.uid,
                isAnonymous: auth.currentUser.isAnonymous,
                phoneNumber: auth.currentUser.phoneNumber,
                email: auth.currentUser.email
              });
              
              // Sign out all users on Android to force fresh login
              console.log('Force signing out existing user on Android');
              await auth.signOut();
            }
            
            // Clear problematic localStorage and sessionStorage
            const keysToCheck = ['demoUser', 'authToken', 'userProfile', 'firebase:authUser'];
            keysToCheck.forEach(key => {
              if (localStorage.getItem(key)) {
                console.log(`Clearing ${key} from localStorage on Android`);
                localStorage.removeItem(key);
              }
              if (sessionStorage.getItem(key)) {
                console.log(`Clearing ${key} from sessionStorage on Android`);
                sessionStorage.removeItem(key);
              }
            });
            
            // Clear Firebase auth persistence
            console.log('Clearing Firebase auth persistence on Android');
            
          } catch (error) {
            console.log('Error clearing auth state on Android:', error);
          }
        };
        
        await clearAuthState();
        
        // Add a small delay to ensure auth state is cleared
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    initializeAuth();
    
    // Check for demo mode first
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      console.log('Demo user found, using demo mode');
      setUser(JSON.parse(demoUser));
      setLoading(false);
      return;
    }

    // Otherwise use Firebase auth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', { 
        hasUser: !!user, 
        uid: user?.uid, 
        phoneNumber: user?.phoneNumber,
        isAnonymous: user?.isAnonymous,
        platform: getPlatform()
      });
      
      // Clear any stale authentication for anonymous users
      if (user && user.isAnonymous) {
        console.log('Anonymous user detected, signing out');
        await auth.signOut();
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }
      
      setUser(user);
      
      if (user) {
        // Check if user has completed profile
        await checkUserProfile(user);
      } else {
        console.log('No user, clearing profile');
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkUserProfile = async (user) => {
    setProfileLoading(true);
    try {
      console.log('Checking user profile for:', user.uid);
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log('User profile found:', userData);
        setUserProfile(userData);
        
        // Check if profile is complete
        const isProfileComplete = userData.name && 
                                 userData.age && 
                                 userData.gender && 
                                 userData.acceptedTerms && 
                                 userData.acceptedPrivacy;
        
        console.log('Profile completion status:', isProfileComplete);
        
        if (!isProfileComplete) {
          console.log('Profile incomplete, redirecting to profile completion');
        } else {
          console.log('Profile is complete, user should have access to all features');
        }
      } else {
        console.log('New user detected, profile needs to be created');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleInstallClick = async () => {
    console.log('Install button clicked, deferredPrompt:', !!deferredPrompt);
    
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        if (outcome === 'accepted') {
          setForceInstallScreen(false);
          setIsPWA(true);
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('Error during install prompt:', error);
      }
    } else {
      // Fallback if deferred prompt isn't available
      alert('To install the app:\n\n' +
            '1. Look for the install icon (📥) in your browser\'s address bar\n' +
            '2. Or go to browser menu → "Install VR FPS Cafe..."\n' +
            '3. Click Install to add the app to your device');
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // Detect user's platform for specific instructions
  const getPlatform = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'ios';
    }
    
    if (/android/i.test(userAgent)) {
      return 'android';
    }
    
    return 'desktop';
  };

  const platform = getPlatform();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Force Install Screen - Block access until PWA is installed
  if (forceInstallScreen) {
    return (
      <div className="force-install-screen">
        <div className="force-install-container">
          <div className="force-install-content">
            <div className="app-icon">
              <div className="app-icon-circle">🎮</div>
            </div>
            
            <h1>VR FPS Cafe</h1>
            <h2>App Installation Required</h2>
            <p className="install-message">
              To ensure the best gaming experience and access to all features, 
              you must install our app on your device.
            </p>

            <div className="platform-instructions">
              {platform === 'ios' && (
                <div className="ios-instructions">
                  <h3>📱 Install on iPhone/iPad:</h3>
                  <ol>
                    <li>Tap the <strong>Share button</strong> (⬆️) at the bottom</li>
                    <li>Scroll and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>"Add"</strong> to install</li>
                    <li>Open the app from your home screen</li>
                  </ol>
                </div>
              )}

              {platform === 'android' && (
                <div className="android-instructions">
                  <h3>🤖 Install on Android:</h3>
                  {deferredPrompt ? (
                    <button onClick={handleInstallClick} className="install-now-btn">
                      📲 Install App Now
                    </button>
                  ) : (
                    <ol>
                      <li>Tap the <strong>menu button</strong> (⋮) in Chrome</li>
                      <li>Select <strong>"Add to Home screen"</strong></li>
                      <li>Tap <strong>"Install"</strong></li>
                      <li>Open the app from your home screen</li>
                    </ol>
                  )}
                </div>
              )}

              {platform === 'desktop' && (
                <div className="desktop-instructions">
                  <h3>💻 Install on Desktop:</h3>
                  {deferredPrompt ? (
                    <button onClick={handleInstallClick} className="install-now-btn">
                      📲 Install App Now
                    </button>
                  ) : (
                    <div>
                      <p><strong>Chrome/Edge:</strong></p>
                      <ol>
                        <li>Look for the <strong>install icon</strong> (📥) in the address bar</li>
                        <li>Click it and select <strong>"Install"</strong></li>
                        <li>Or go to menu (⋮) → <strong>"Install VR FPS Cafe..."</strong></li>
                      </ol>
                      <p style="margin-top: 15px;"><strong>Alternative:</strong></p>
                      <ol>
                        <li>Press <strong>Ctrl+Shift+I</strong> (Windows) or <strong>Cmd+Option+I</strong> (Mac)</li>
                        <li>Go to <strong>Application</strong> tab</li>
                        <li>Click <strong>"Install"</strong> next to the manifest</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="install-benefits">
              <h3>🚀 Why Install?</h3>
              <ul>
                <li>⚡ Faster loading and better performance</li>
                <li>📱 Native app experience</li>
                <li>🔔 Push notifications for bookings</li>
                <li>🌐 Works offline</li>
                <li>🎯 Direct access from home screen</li>
              </ul>
            </div>

            <div className="force-install-footer">
              <p>
                <strong>🚫 Web access is restricted.</strong><br/>
                Install the app to continue gaming!
              </p>
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">
                  🎮 <strong>VR FPS Cafe</strong> is designed as a native app experience.<br/>
                  Please install to enjoy all features and optimal performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile completion check
  const isProfileComplete = userProfile && 
                            userProfile.name && 
                            userProfile.age && 
                            userProfile.gender && 
                            userProfile.acceptedTerms && 
                            userProfile.acceptedPrivacy;

  // Component to handle protected routes
  const ProtectedRoute = ({ children, path }) => {
    console.log('ProtectedRoute check:', { 
      path, 
      hasUser: !!user, 
      userIsAnonymous: user?.isAnonymous,
      userPhoneNumber: user?.phoneNumber,
      profileLoading, 
      hasUserProfile: !!userProfile, 
      isProfileComplete,
      userProfileData: userProfile,
      platform: getPlatform()
    });
    
    // If user is anonymous or doesn't have proper authentication, redirect to login
    if (!user || user.isAnonymous || (!user.phoneNumber && !user.email)) {
      console.log('Invalid or missing authentication, redirecting to login');
      return <Login path={path} />;
    }
    
    if (profileLoading) {
      console.log('Profile loading, showing spinner');
      return (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      );
    }
    
    if (user && !isProfileComplete && path !== '/profile') {
      console.log('Profile incomplete, showing profile form');
      // Consider user as "new" if they don't have a complete profile
      const isNewUser = !userProfile || !userProfile.name || !userProfile.acceptedTerms || !userProfile.acceptedPrivacy;
      return <Profile user={user} isNewUser={isNewUser} onProfileComplete={() => checkUserProfile(user)} />;
    }
    
    console.log('All checks passed, rendering protected content');
    return children;
  };

  return (
    <div id="app">
      {/* Install Prompt Banner - Only show if PWA but still has prompt available */}
      {isPWA && showInstallPrompt && !localStorage.getItem('installPromptDismissed') && (
        <div className="install-prompt">
          <div className="install-content">
            <div>
              <h4>📱 Upgrade Experience</h4>
              <p>Get the latest version for better performance!</p>
            </div>
            <div className="install-buttons">
              <button onClick={handleInstallClick} className="install-btn">
                Update
              </button>
              <button onClick={dismissInstallPrompt} className="dismiss-btn">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      {user && isProfileComplete && <Navbar user={user} userProfile={userProfile} />}
      <Router>
        <ProtectedRoute path="/">
          <Home user={user} userProfile={userProfile} />
        </ProtectedRoute>
        
        <Login path="/login" />
        
        <ProtectedRoute path="/profile">
          <Profile user={user} isNewUser={!isProfileComplete} onProfileComplete={() => checkUserProfile(user)} />
        </ProtectedRoute>
        

        
        <ProtectedRoute path="/booking">
          <Booking user={user} userProfile={userProfile} />
        </ProtectedRoute>
        
        <ProtectedRoute path="/leaderboard">
          <Leaderboard user={user} userProfile={userProfile} />
        </ProtectedRoute>
        
        <ProtectedRoute path="/game-lobby">
          <GameLobby user={user} userProfile={userProfile} />
        </ProtectedRoute>

        <GameLookup path="/game-lookup" />
        
        <ProtectedRoute path="/stats">
          <Stats user={user} userProfile={userProfile} />
        </ProtectedRoute>
        

      </Router>
    </div>
  );
} 