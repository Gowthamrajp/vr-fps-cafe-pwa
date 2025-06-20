import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';

export default function Home({ user }) {
  const [userStats, setUserStats] = useState({
    kills: 0,
    matches: 0,
    wins: 0,
    playTime: 0
  });

  useEffect(() => {
    if (!user) {
      route('/login');
      return;
    }
    
    // Load user stats from Firebase
    // This would be replaced with actual Firebase calls
    setUserStats({
      kills: 156,
      matches: 23,
      wins: 18,
      playTime: 45
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="container" style="padding-top: 32px;">
      <div className="fade-in">
        <h1>Welcome back, {user.displayName || 'Player'}! 🎮</h1>
        
        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{userStats.kills}</div>
            <div className="stat-label">Total Kills</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.matches}</div>
            <div className="stat-label">Matches Played</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.wins}</div>
            <div className="stat-label">Victories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.playTime}h</div>
            <div className="stat-label">Play Time</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-2">
          <div className="card">
            <h3>🎯 Quick Game</h3>
            <p>Jump into a match instantly with other players online.</p>
            <br />
            <button 
              className="btn btn-primary btn-full"
              onClick={() => route('/game-lobby')}
            >
              Start Game
            </button>
          </div>

          <div className="card">
            <h3>📅 Book Session</h3>
            <p>Reserve your VR gaming session and pay in advance.</p>
            <br />
            <button 
              className="btn btn-secondary btn-full"
              onClick={() => route('/booking')}
            >
              Book Now
            </button>
          </div>

          <div className="card">
            <h3>👥 Manage Team</h3>
            <p>Create or join teams, manage your squad for competitions.</p>
            <br />
            <button 
              className="btn btn-secondary btn-full"
              onClick={() => route('/teams')}
            >
              View Teams
            </button>
          </div>

          <div className="card">
            <h3>🏆 Leaderboards</h3>
            <p>Check your ranking and compete with other players.</p>
            <br />
            <button 
              className="btn btn-secondary btn-full"
              onClick={() => route('/leaderboard')}
            >
              View Rankings
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3>📈 Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">2 hours ago</span>
              <span className="activity-text">Won match in Dust Palace (15 kills)</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">1 day ago</span>
              <span className="activity-text">Joined team "Elite Strikers"</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">2 days ago</span>
              <span className="activity-text">Completed 5-hour gaming session</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .activity-list {
          space-y: 12px;
        }
        
        .activity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-color);
        }
        
        .activity-item:last-child {
          border-bottom: none;
        }
        
        .activity-time {
          color: var(--text-secondary);
          font-size: 0.9rem;
          min-width: 100px;
        }
        
        .activity-text {
          flex: 1;
          margin-left: 16px;
        }
      `}</style>
    </div>
  );
} 