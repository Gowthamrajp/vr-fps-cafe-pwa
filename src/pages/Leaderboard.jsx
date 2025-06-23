import { useState, useEffect } from 'preact/hooks';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { route } from 'preact-router';

export default function Leaderboard({ user }) {
  const [activeTab, setActiveTab] = useState('overall');
  const [leaderboards, setLeaderboards] = useState({
    overall: [],
    school: [],
    college: [],
    area: []
  });
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    if (!user) {
      route('/login');
      return;
    }
    loadLeaderboards();
  }, [user]);

  const loadLeaderboards = async () => {
    try {
      // Mock data - in real app, this would come from Firebase
      const mockData = {
        overall: [
          { id: 1, name: 'ProGamer123', kills: 1250, matches: 45, wins: 38, score: 2400 },
          { id: 2, name: 'SniperElite', kills: 1180, matches: 42, wins: 35, score: 2300 },
          { id: 3, name: 'BlastMaster', kills: 1050, matches: 38, wins: 30, score: 2100 },
          { id: 4, name: 'VRWarrior', kills: 980, matches: 35, wins: 28, score: 1950 },
          { id: 5, name: 'HeadShot', kills: 920, matches: 33, wins: 25, score: 1800 },
          { id: 6, name: 'GameMaster', kills: 850, matches: 30, wins: 22, score: 1650 },
          { id: 7, name: 'FPSKing', kills: 780, matches: 28, wins: 20, score: 1500 },
          { id: 8, name: 'VRChamp', kills: 720, matches: 25, wins: 18, score: 1350 },
          { id: 9, name: 'BattleAce', kills: 650, matches: 22, wins: 15, score: 1200 },
          { id: 10, name: user.displayName || 'You', kills: 580, matches: 20, wins: 13, score: 1050, isCurrentUser: true }
        ],
        school: [
          { id: 1, name: 'StudentAce', school: 'Delhi Public School', kills: 850, score: 1600 },
          { id: 2, name: 'SchoolChamp', school: 'Ryan International', kills: 780, score: 1450 },
          { id: 3, name: 'TopStudent', school: 'DAV Public School', kills: 720, score: 1350 },
          { id: 4, name: user.displayName || 'You', school: 'Your School', kills: 580, score: 1050, isCurrentUser: true }
        ],
        college: [
          { id: 1, name: 'CollegePro', college: 'IIT Delhi', kills: 1100, score: 2000 },
          { id: 2, name: 'TechGamer', college: 'BITS Pilani', kills: 950, score: 1750 },
          { id: 3, name: 'EngineerFPS', college: 'NSIT Delhi', kills: 880, score: 1600 },
          { id: 4, name: user.displayName || 'You', college: 'Your College', kills: 580, score: 1050, isCurrentUser: true }
        ],
        area: [
          { id: 1, name: 'LocalHero', area: 'Connaught Place', kills: 1200, score: 2200 },
          { id: 2, name: 'AreaChamp', area: 'Karol Bagh', kills: 1050, score: 1900 },
          { id: 3, name: 'DistrictKing', area: 'Lajpat Nagar', kills: 900, score: 1650 },
          { id: 4, name: user.displayName || 'You', area: 'Your Area', kills: 580, score: 1050, isCurrentUser: true }
        ]
      };
      
      setLeaderboards(mockData);
      
      // Calculate user's rank for each category
      const userRanks = {};
      Object.keys(mockData).forEach(category => {
        const userIndex = mockData[category].findIndex(player => player.isCurrentUser);
        if (userIndex !== -1) {
          userRanks[category] = {
            rank: userIndex + 1,
            player: mockData[category][userIndex]
          };
        }
      });
      setUserRank(userRanks);
      
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLeaderboard = (players) => (
    <div className="leaderboard-list">
      {players.map((player, index) => (
        <div key={player.id} className={`leaderboard-item ${player.isCurrentUser ? 'current-user' : ''}`}>
          <div className={`rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
            {index + 1}
          </div>
          <div className="player-info">
            <div className="player-name">
              {player.name}
              {player.isCurrentUser && <span className="you-badge">YOU</span>}
            </div>
            <div className="player-details">
              {player.school && `School: ${player.school}`}
              {player.college && `College: ${player.college}`}
              {player.area && `Area: ${player.area}`}
              {!player.school && !player.college && !player.area && 
                `${player.matches} matches • ${player.wins} wins`}
            </div>
          </div>
          <div className="player-stats">
            <div className="player-score">{player.score}</div>
            <div className="stat-small">{player.kills} kills</div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!user) return null;

  return (
    <div className="container main-content" style="padding-top: 32px;">
      <h1>🏆 Leaderboards</h1>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overall' ? 'active' : ''}`}
          onClick={() => setActiveTab('overall')}
        >
          Overall
        </button>
        <button 
          className={`tab ${activeTab === 'school' ? 'active' : ''}`}
          onClick={() => setActiveTab('school')}
        >
          School
        </button>
        <button 
          className={`tab ${activeTab === 'college' ? 'active' : ''}`}
          onClick={() => setActiveTab('college')}
        >
          College
        </button>
        <button 
          className={`tab ${activeTab === 'area' ? 'active' : ''}`}
          onClick={() => setActiveTab('area')}
        >
          Area
        </button>
      </div>

      {/* Current User Rank Card */}
      {userRank && userRank[activeTab] && (
        <div className="card user-rank-card">
          <h3>🎯 Your Rank</h3>
          <div className="user-rank-display">
            <div className="rank-number">#{userRank[activeTab].rank}</div>
            <div className="rank-details">
              <div className="rank-score">{userRank[activeTab].player.score} pts</div>
              <div className="rank-stats">{userRank[activeTab].player.kills} kills</div>
            </div>
            <div className="rank-progress">
              {userRank[activeTab].rank > 1 ? (
                <div className="next-rank">
                  <span>#{userRank[activeTab].rank - 1}</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={`width: ${Math.min(80, (userRank[activeTab].player.score / (userRank[activeTab].player.score + 150)) * 100)}%`}></div>
                  </div>
                </div>
              ) : (
                <div className="champion-badge">👑</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <h3>
              {activeTab === 'overall' && '🌟 Top Players'}
              {activeTab === 'school' && '🎓 School Champions'}
              {activeTab === 'college' && '🏫 College Leaders'}
              {activeTab === 'area' && '📍 Area Heroes'}
            </h3>
            {renderLeaderboard(leaderboards[activeTab])}
          </>
        )}
      </div>

      <style jsx>{`
        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
        }
        
        .tab {
          padding: 12px 24px;
          border: 1px solid var(--border-color);
          background: white;
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .tab.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        .tab:hover:not(.active) {
          background: var(--bg-light);
        }
        
        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .player-stats {
          text-align: right;
        }
        
        .stat-small {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .current-user {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border: 2px solid #667eea;
          border-radius: 12px;
        }
        
        .you-badge {
          background: #667eea;
          color: white;
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 12px;
          margin-left: 8px;
          font-weight: 600;
        }
        
        .user-rank-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin-bottom: 16px;
          padding: 16px;
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
        
        .champion-badge {
          font-size: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .tabs {
            justify-content: center;
          }
          
          .tab {
            flex: 1;
            text-align: center;
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
        }
      `}</style>
    </div>
  );
} 