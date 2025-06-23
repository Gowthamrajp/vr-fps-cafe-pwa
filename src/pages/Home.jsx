import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';

export default function Home({ user, userProfile }) {
  const [userStats, setUserStats] = useState({
    kills: 0,
    matches: 0,
    wins: 0,
    playTime: 0
  });

  const [playerID, setPlayerID] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate unique player ID based on user data
  const generatePlayerID = (user, userProfile) => {
    if (!user) return '';
    
    // Create a unique ID based on user data
    const name = (userProfile?.name || user.displayName || 'Player').replace(/\s+/g, '').toUpperCase();
    const uid = user.uid.slice(-6).toUpperCase(); // Last 6 characters of UID
    const phoneDigits = user.phoneNumber ? user.phoneNumber.slice(-4) : '0000';
    
    return `${name.slice(0, 4)}${uid}${phoneDigits}`;
  };

  // Copy player ID to clipboard
  const copyPlayerID = async () => {
    try {
      await navigator.clipboard.writeText(playerID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = playerID;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!user) {
      route('/login');
      return;
    }
    
    // Generate player ID
    setPlayerID(generatePlayerID(user, userProfile));
    
    // Load user stats from Firebase
    // This would be replaced with actual Firebase calls
    setUserStats({
      kills: 156,
      matches: 23,
      wins: 18,
      playTime: 45
    });
  }, [user, userProfile]);

  if (!user) return null;

  return (
    <div className="home-container main-content">
      <div className="fade-in">
        {/* Compact Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="user-name">Welcome, {user.displayName || userProfile?.name || 'Player'}!</span>
              <span className="game-emoji">🎮</span>
            </h1>
          </div>
        </div>

        {/* Player ID Card */}
        <div className="card player-id-card">
          <div className="player-id-header">
            <h3>🆔 Your Player ID</h3>
            <p className="player-id-description">Share this ID with friends to join your games</p>
          </div>
          <div className="player-id-display">
            <div className="player-id-code">{playerID}</div>
            <button 
              className={`copy-button ${copied ? 'copied' : ''}`}
              onClick={copyPlayerID}
              disabled={!playerID}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>

        {/* Your Rank Card */}
        <div className="card user-rank-card">
          <h3>🎯 Your Rank</h3>
          <div className="user-rank-display">
            <div className="rank-number">#10</div>
            <div className="rank-details">
              <div className="rank-score">{userStats.kills * 18} pts</div>
              <div className="rank-stats">{userStats.kills} kills • {userStats.wins} wins</div>
            </div>
            <div className="rank-progress">
              <div className="next-rank">
                <span>#9</span>
                <div className="progress-bar">
                  <div className="progress-fill" style="width: 75%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="stats-section">
          <h2 className="section-title">Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-card highlight">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{userStats.kills}</div>
              <div className="stat-label">Total Kills</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚔️</div>
              <div className="stat-value">{userStats.matches}</div>
              <div className="stat-label">Matches</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{userStats.wins}</div>
              <div className="stat-label">Victories</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value">{userStats.playTime}h</div>
              <div className="stat-label">Play Time</div>
            </div>
          </div>
        </div>



        {/* Recent Activity */}
        <div className="activity-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-card">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">🎯</div>
                <div className="activity-content">
                  <div className="activity-text">Won match in Dust Palace</div>
                  <div className="activity-details">15 kills • 2 hours ago</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🎮</div>
                <div className="activity-content">
                  <div className="activity-text">Booked premium gaming session</div>
                  <div className="activity-details">1 day ago</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">⏰</div>
                <div className="activity-content">
                  <div className="activity-text">Completed 5-hour gaming session</div>
                  <div className="activity-details">2 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <style jsx>{`
        .home-container {
          padding: 16px;
          max-width: 1200px;
          margin: 0 auto;
          background: #f8fafc;
          color: #2d3748;
          min-height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .hero-section {
          text-align: center;
          padding: 20px 0 24px 0;
          margin-bottom: 24px;
          position: relative;
        }

        .status-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          background: #48bb78;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-text {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1px;
          color: #48bb78;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .hero-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .welcome-text {
          color: #718096;
          font-size: 1rem;
          font-weight: 500;
        }

        .user-name {
          color: #6366f1;
          font-size: 2rem;
          font-weight: 700;
        }

        .hero-subtitle {
          color: #718096;
          font-size: 1rem;
          font-weight: 500;
        }

        .stats-section {
          margin-bottom: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px 8px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 16px 16px 0 0;
        }

        .stat-card.highlight {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border-color: #6366f1;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }

        .stat-card:not(.highlight):hover {
          background: white;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
          border-color: #6366f1;
        }

        .stat-card:not(.highlight):hover::before {
          opacity: 1;
        }

        .stat-icon {
          width: 20px;
          height: 20px;
          margin: 0 auto 8px auto;
          color: #6366f1;
        }

        .stat-card.highlight .stat-icon {
          color: white;
        }

        .stat-value {
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.8;
        }

        .stat-card.highlight .stat-label {
          color: white;
          opacity: 0.9;
        }

        /* Rank Card Styles */
        .user-rank-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin-bottom: 16px;
          padding: 16px;
          border: none;
        }

        .user-rank-card h3 {
          color: white;
          margin-bottom: 12px;
          font-size: 1rem;
        }

        .user-rank-display {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rank-number {
          font-size: 1.8rem;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 8px 12px;
          min-width: 60px;
          text-align: center;
        }

        .rank-details {
          flex: 1;
        }

        .rank-score {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .rank-stats {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .rank-progress {
          text-align: center;
          min-width: 60px;
        }

        .next-rank span {
          font-size: 0.8rem;
          opacity: 0.9;
          display: block;
          margin-bottom: 4px;
        }

        .progress-bar {
          width: 50px;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          margin: 0 auto;
        }

        .progress-fill {
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .actions-section {
          margin-bottom: 24px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .action-btn {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: #2d3748;
          touch-action: manipulation;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .primary-btn {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border-color: #6366f1;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
          grid-column: span 2;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
        }

        .secondary-btn:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          border-color: #6366f1;
        }

        .btn-icon {
          width: 24px;
          height: 24px;
          margin-bottom: 8px;
          color: #6366f1;
        }

        .primary-btn .btn-icon {
          color: white;
        }

        .btn-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .activity-section {
          margin-bottom: 24px;
        }

        .activity-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .activity-title {
          font-size: 1rem;
          font-weight: 600;
          color: #2d3748;
        }

        .activity-indicator {
          width: 6px;
          height: 6px;
          background: #48bb78;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .activity-item:hover {
          background: white;
          border-color: #6366f1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }
        
        .activity-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: #6366f1;
        }

        .activity-content {
          flex: 1;
        }
        
        .activity-text {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 2px;
          font-size: 0.9rem;
        }

        .activity-details {
          font-size: 0.8rem;
          color: #718096;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .home-container {
            padding: 12px;
          }

          .hero-title {
            font-size: 1.6rem;
          }

          .user-name {
            font-size: 1.8rem;
          }

          .user-rank-card {
            padding: 12px;
            margin-bottom: 12px;
          }

          .user-rank-card h3 {
            font-size: 0.9rem;
            margin-bottom: 8px;
          }

          .user-rank-display {
            gap: 8px;
          }

          .rank-number {
            font-size: 1.5rem;
            padding: 6px 8px;
            min-width: 50px;
          }

          .rank-score {
            font-size: 1rem;
          }

          .rank-stats {
            font-size: 0.75rem;
          }

          .progress-bar {
            width: 40px;
            height: 3px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }

          .stat-card {
            padding: 12px 6px;
          }

          .stat-icon {
            width: 16px;
            height: 16px;
            margin-bottom: 6px;
          }

          .stat-value {
            font-size: 1.2rem;
          }

          .stat-label {
            font-size: 0.6rem;
          }

          .actions-grid {
            grid-template-columns: 1fr;
            gap: 6px;
          }

          .primary-btn {
            grid-column: span 1;
          }

          .action-btn {
            padding: 16px 10px;
          }

          .btn-icon {
            width: 20px;
            height: 20px;
            margin-bottom: 6px;
          }

          .btn-label {
            font-size: 0.75rem;
          }

          .activity-item {
            padding: 10px;
            gap: 10px;
          }

          .activity-icon {
            width: 14px;
            height: 14px;
          }

          .activity-text {
            font-size: 0.75rem;
          }

          .activity-details {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
} 