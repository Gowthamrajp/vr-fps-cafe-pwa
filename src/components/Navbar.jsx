import { useState } from 'preact/hooks';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { route } from 'preact-router';

export default function Navbar({ user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      route('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <a href="/" className="navbar-brand">
            🎮 VR FPS Cafe
          </a>
          
          <ul className="navbar-nav">
            <li><a href="/" className="nav-link">Home</a></li>
            <li><a href="/teams" className="nav-link">Teams</a></li>
            <li><a href="/booking" className="nav-link">Book Game</a></li>
            <li><a href="/leaderboard" className="nav-link">Leaderboard</a></li>
            <li><a href="/stats" className="nav-link">Stats</a></li>
            <li><a href="/game-lobby" className="nav-link">Game Lobby</a></li>
          </ul>

          <div className="user-menu">
            <div className="dropdown">
              <button 
                className="btn btn-secondary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                👤 {user?.displayName || user?.phoneNumber || 'User'}
              </button>
              
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <a href="/profile" className="dropdown-item">Profile</a>
                  <button 
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dropdown {
          position: relative;
          display: inline-block;
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          min-width: 150px;
          z-index: 1000;
        }
        
        .dropdown-item {
          display: block;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          color: var(--text-primary);
          text-decoration: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .dropdown-item:hover {
          background-color: var(--bg-light);
        }
        
        @media (max-width: 768px) {
          .navbar-nav {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
} 