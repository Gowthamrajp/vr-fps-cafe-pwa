import { useState, useEffect } from 'preact/hooks';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { route } from 'preact-router';
import ProfileImage from './ProfileImage';

export default function Navbar({ user, userProfile }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);


  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }



    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the stored prompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear any demo user data
      localStorage.removeItem('demoUser');
      route('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  const handleNavClick = () => {
    setShowMobileMenu(false);
  };

  const handleManualUpdate = async () => {
    try {
      console.log('Manual update requested');
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        console.log('All caches cleared');
      }
      
      // Unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
        console.log('Service worker unregistered');
      }
      
      // Force hard reload to get latest code
      window.location.reload(true);
      
    } catch (error) {
      console.error('Error during manual update:', error);
      // Fallback: simple reload
      window.location.reload();
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <a href="/" className="navbar-brand">
              🎮 VR FPS Cafe
            </a>
            
            {/* Desktop Navigation */}
            {user && (
              <ul className="navbar-nav desktop-nav">
                <li><a href="/" className="nav-link">Home</a></li>
                <li><a href="/booking" className="nav-link">Book Game</a></li>
                <li><a href="/leaderboard" className="nav-link">Leaderboard</a></li>
                <li><a href="/stats" className="nav-link">Stats</a></li>
                <li><a href="/game-lobby" className="nav-link">Start Game</a></li>
              </ul>
            )}

            <div className="navbar-actions">
              {/* Install PWA Button */}
              {showInstallButton && (
                <button 
                  onClick={handleInstallClick}
                  className="btn btn-outline install-btn"
                  title="Install App"
                >
                  📲 Install App
                </button>
              )}

              {user ? (
                <>
                  {/* Mobile Menu Button */}
                  <button 
                    className="mobile-menu-btn"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </button>

                  {/* Desktop User Menu */}
                  <div className="user-menu desktop-menu">
                    <button 
                      className="user-avatar" 
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      <ProfileImage 
                        src={userProfile?.profilePictureURL} 
                        size="32px"
                        className="avatar-img"
                      />
                      <span className="user-name">{user.displayName || userProfile?.name || 'User'}</span>
                    </button>
                    
                    {showMenu && (
                      <div className="dropdown-menu">
                        <div className="dropdown-header">
                          <strong>{user.displayName || 'User'}</strong>
                          <small>{user.phoneNumber}</small>
                        </div>
                        <a href="/profile" className="dropdown-item" onClick={() => setShowMenu(false)}>Profile</a>
                        <a href="/stats" className="dropdown-item" onClick={() => setShowMenu(false)}>Statistics</a>
                        <button onClick={handleLogout} className="dropdown-item logout-btn">
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <a href="/login" className="btn btn-primary">Login</a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && user && (
        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="user-info">
                <ProfileImage 
                  src={userProfile?.profilePictureURL} 
                  size="60px"
                  className="user-avatar-large"
                />
                <div>
                  <strong>{user.displayName || userProfile?.name || 'User'}</strong>
                  <small>{user.phoneNumber}</small>
                </div>
              </div>
              <button 
                className="close-btn"
                onClick={() => setShowMobileMenu(false)}
              >
                ×
              </button>
            </div>
            
            <div className="mobile-menu-items">
              <a href="/profile" className="mobile-menu-item" onClick={handleNavClick}>
                👤 Profile
              </a>
              <button onClick={handleManualUpdate} className="mobile-menu-item update-item">
                🔄 Force Update
              </button>
               <button onClick={handleLogout} className="mobile-menu-item logout-item">
                 🚪 Logout
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      {user && (
        <nav className="bottom-nav">
          <a href="/" className="bottom-nav-item">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </a>
          <a href="/booking" className="bottom-nav-item">
            <span className="nav-icon">🎮</span>
            <span className="nav-label">Book</span>
          </a>
          <a href="/game-lobby" className="bottom-nav-item center-item">
            <span className="nav-icon">🚀</span>
            <span className="nav-label">Start Game</span>
          </a>
          <a href="/leaderboard" className="bottom-nav-item">
            <span className="nav-icon">🏆</span>
            <span className="nav-label">Ranks</span>
          </a>
          <a href="/stats" className="bottom-nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-label">Stats</span>
          </a>
        </nav>
      )}

      <style jsx>{`
        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .desktop-nav {
          display: flex;
          list-style: none;
          gap: 24px;
          margin: 0;
          padding: 0;
        }

        .desktop-nav .nav-link {
          color: #2d3748;
          text-decoration: none;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .desktop-nav .nav-link:hover {
          background: #f7fafc;
          color: #6366f1;
        }

        .install-btn, .update-btn {
          padding: 8px 16px;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .update-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: 1px solid #10b981;
        }

        .update-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          gap: 4px;
        }

        .mobile-menu-btn span {
          width: 20px;
          height: 2px;
          background: #2d3748;
          border-radius: 1px;
          transition: all 0.3s ease;
        }

        /* Desktop User Menu */
        .user-menu {
          position: relative;
          display: inline-block;
        }

        .user-avatar {
          background: #f8f9fa;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 12px;
          color: #2d3748;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-avatar .user-name {
          margin-left: 4px;
        }

        .user-avatar:hover {
          background: #e2e8f0;
          border-color: #cbd5e0;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          min-width: 200px;
          z-index: 9999;
          overflow: hidden;
          animation: dropdownSlideIn 0.2s ease-out;
        }

        .dropdown-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8f9fa;
        }

        .dropdown-header strong {
          display: block;
          color: #2d3748;
          font-size: 1rem;
          font-weight: 600;
        }

        .dropdown-header small {
          color: #718096;
          font-size: 0.85rem;
          margin-top: 2px;
        }
        
        .dropdown-item {
          display: block;
          width: 100%;
          padding: 14px 20px;
          border: none;
          background: none;
          color: #2d3748;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          text-align: left;
          border-left: 3px solid transparent;
        }
        
        .dropdown-item:hover {
          background-color: #f7fafc;
          border-left-color: #6366f1;
          padding-left: 17px;
        }

        .logout-btn {
          border-top: 1px solid #e2e8f0;
          color: #e53e3e;
          margin-top: 4px;
        }

        .logout-btn:hover {
          background-color: #fed7d7;
          border-left-color: #e53e3e;
        }

        /* Mobile Menu Styles */
        .mobile-menu-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 10000;
        }

        .mobile-menu {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 280px;
          background: white;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          animation: slideInFromRight 0.3s ease-out;
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8f9fa;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar-large {
          width: 48px;
          height: 48px;
          background: #6366f1;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .user-info strong {
          display: block;
          color: #2d3748;
          font-size: 1rem;
          font-weight: 600;
        }

        .user-info small {
          display: block;
          color: #718096;
          font-size: 0.85rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 28px;
          color: #718096;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #2d3748;
        }

        .mobile-menu-items {
          padding: 20px 0;
        }

        .mobile-menu-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 16px 20px;
          border: none;
          background: none;
          color: #2d3748;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
          text-align: left;
          border-left: 4px solid transparent;
        }

        .mobile-menu-item:hover {
          background: #f7fafc;
          border-left-color: #6366f1;
        }

        .update-item {
          color: #10b981;
        }

        .update-item:hover {
          background: #d1fae5;
          border-left-color: #10b981;
        }

        .logout-item {
          color: #e53e3e;
          border-top: 1px solid #e2e8f0;
          margin-top: 8px;
        }

        .logout-item:hover {
          background: #fed7d7;
          border-left-color: #e53e3e;
        }

        /* Bottom Navigation */
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e2e8f0;
          padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
          z-index: 1000;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: #718096;
          transition: all 0.2s ease;
          padding: 8px 4px;
          min-height: 56px;
          justify-content: center;
        }

        .bottom-nav-item:hover,
        .bottom-nav-item.active {
          color: #6366f1;
        }

        .nav-icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 500;
        }

        .center-item {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white !important;
          border-radius: 20px 20px 0 0;
          margin: 0 4px;
          position: relative;
          transform: translateY(-8px);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .center-item:hover {
          color: white !important;
          transform: translateY(-10px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .center-item .nav-icon {
          font-size: 24px;
          margin-bottom: 2px;
        }

        .center-item .nav-label {
          font-weight: 600;
          font-size: 10px;
        }
        
        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .desktop-menu {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .mobile-menu-overlay {
            display: block;
          }

          .bottom-nav {
            display: flex;
          }

          .bottom-nav-item {
            flex: 1;
          }

          .install-btn {
            padding: 6px 12px;
            font-size: 0.8rem;
          }
        }


      `}</style>
    </>
  );
} 