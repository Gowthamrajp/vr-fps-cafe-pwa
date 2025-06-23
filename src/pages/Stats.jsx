import { useState, useEffect } from 'preact/hooks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { route } from 'preact-router';

export default function Stats({ user }) {
  const [stats, setStats] = useState({
    kills: 0,
    deaths: 0,
    matches: 0,
    wins: 0,
    losses: 0,
    playTime: 0,
    headshots: 0,
    accuracy: 0,
    favoriteWeapon: 'Assault Rifle',
    longestKillStreak: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      route('/login');
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      // Mock data - in real app, this would come from Firebase
      const mockStats = {
        kills: 1250,
        deaths: 320,
        matches: 45,
        wins: 32,
        losses: 13,
        playTime: 125, // hours
        headshots: 450,
        accuracy: 78.5,
        favoriteWeapon: 'Sniper Rifle',
        longestKillStreak: 18
      };

      const mockAchievements = [
        { id: 1, name: 'First Blood', description: 'Get your first kill', unlocked: true },
        { id: 2, name: 'Headshot Master', description: 'Get 100 headshots', unlocked: true },
        { id: 3, name: 'Victory Streak', description: 'Win 5 matches in a row', unlocked: true },
        { id: 4, name: 'Social Player', description: 'Play 10 multiplayer matches', unlocked: false },
        { id: 5, name: 'Legendary', description: 'Reach 1000 kills', unlocked: true },
        { id: 6, name: 'Marathon Gamer', description: 'Play for 100+ hours', unlocked: true }
      ];

      setStats(mockStats);
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKDRatio = () => {
    return stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);
  };

  const calculateWinRate = () => {
    return stats.matches > 0 ? ((stats.wins / stats.matches) * 100).toFixed(1) : '0.0';
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container main-content" style="padding-top: 32px;">
      <h1>📊 My Statistics</h1>

      {/* Main Stats */}
      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.kills}</div>
          <div className="stat-label">Kills</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚔️</div>
          <div className="stat-value">{calculateKDRatio()}</div>
          <div className="stat-label">K/D Ratio</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{calculateWinRate()}%</div>
          <div className="stat-label">Win Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{stats.playTime}h</div>
          <div className="stat-label">Hours</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Detailed Stats */}
        <div className="card">
          <h3>🎯 Combat Statistics</h3>
          <div className="stat-rows">
            <div className="stat-row">
              <span>Kills</span>
              <span>{stats.kills}</span>
            </div>
            <div className="stat-row">
              <span>Deaths</span>
              <span>{stats.deaths}</span>
            </div>
            <div className="stat-row">
              <span>Headshots</span>
              <span>{stats.headshots}</span>
            </div>
            <div className="stat-row">
              <span>Accuracy</span>
              <span>{stats.accuracy}%</span>
            </div>
            <div className="stat-row">
              <span>Longest Kill Streak</span>
              <span>{stats.longestKillStreak}</span>
            </div>
            <div className="stat-row">
              <span>Favorite Weapon</span>
              <span>{stats.favoriteWeapon}</span>
            </div>
          </div>
        </div>

        {/* Match Stats */}
        <div className="card">
          <h3>🏆 Match Statistics</h3>
          <div className="stat-rows">
            <div className="stat-row">
              <span>Total Matches</span>
              <span>{stats.matches}</span>
            </div>
            <div className="stat-row">
              <span>Wins</span>
              <span>{stats.wins}</span>
            </div>
            <div className="stat-row">
              <span>Losses</span>
              <span>{stats.losses}</span>
            </div>
            <div className="stat-row">
              <span>Win Rate</span>
              <span>{calculateWinRate()}%</span>
            </div>
            <div className="stat-row">
              <span>Total Play Time</span>
              <span>{stats.playTime} hours</span>
            </div>
            <div className="stat-row">
              <span>Average Match Time</span>
              <span>{stats.matches > 0 ? ((stats.playTime * 60) / stats.matches).toFixed(1) : '0'} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3>🏅 Achievements</h3>
        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div key={achievement.id} className={`achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">
                {achievement.unlocked ? '🏆' : '🔒'}
              </div>
              <div className="achievement-info">
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-desc">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 16px 12px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.8);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
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
        }

        .stat-card.highlight {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
        }

        .stat-card.highlight::before {
          opacity: 0;
        }

        .stat-card:not(.highlight):hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border-color: rgba(99, 102, 241, 0.2);
        }

        .stat-card:not(.highlight):hover::before {
          opacity: 1;
        }

        .stat-icon {
          font-size: 28px;
          margin-bottom: 6px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .stat-card.highlight .stat-icon {
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 2px;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 0.75rem;
          opacity: 0.75;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-card.highlight .stat-label {
          opacity: 0.9;
        }

        .stat-rows {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color);
        }
        
        .stat-row:last-child {
          border-bottom: none;
        }
        
        .stat-row span:last-child {
          font-weight: 600;
          color: var(--primary-color);
        }
        
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .achievement {
          display: flex;
          align-items: center;
          padding: 16px;
          background: var(--bg-light);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }
        
        .achievement.unlocked {
          background: rgba(40, 167, 69, 0.1);
          border-color: var(--success-color);
        }
        
        .achievement.locked {
          opacity: 0.6;
        }
        
        .achievement-icon {
          font-size: 2rem;
          margin-right: 16px;
        }
        
        .achievement-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .achievement-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }

          .stat-card {
            padding: 14px 10px;
            border-radius: 18px;
          }

          .stat-icon {
            font-size: 24px;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 1.6rem;
            font-weight: 800;
          }

          .stat-label {
            font-size: 0.7rem;
            letter-spacing: 0.3px;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
          }
          
          .achievement {
            flex-direction: column;
            text-align: center;
          }
          
          .achievement-icon {
            margin-right: 0;
            margin-bottom: 12px;
          }
        }
      `}</style>
    </div>
  );
} 