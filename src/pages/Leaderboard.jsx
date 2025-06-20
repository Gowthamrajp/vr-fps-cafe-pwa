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
          { id: 5, name: 'HeadShot', kills: 920, matches: 33, wins: 25, score: 1800 }
        ],
        school: [
          { id: 1, name: 'StudentAce', school: 'Delhi Public School', kills: 850, score: 1600 },
          { id: 2, name: 'SchoolChamp', school: 'Ryan International', kills: 780, score: 1450 },
          { id: 3, name: 'TopStudent', school: 'DAV Public School', kills: 720, score: 1350 }
        ],
        college: [
          { id: 1, name: 'CollegePro', college: 'IIT Delhi', kills: 1100, score: 2000 },
          { id: 2, name: 'TechGamer', college: 'BITS Pilani', kills: 950, score: 1750 },
          { id: 3, name: 'EngineerFPS', college: 'NSIT Delhi', kills: 880, score: 1600 }
        ],
        area: [
          { id: 1, name: 'LocalHero', area: 'Connaught Place', kills: 1200, score: 2200 },
          { id: 2, name: 'AreaChamp', area: 'Karol Bagh', kills: 1050, score: 1900 },
          { id: 3, name: 'DistrictKing', area: 'Lajpat Nagar', kills: 900, score: 1650 }
        ]
      };
      
      setLeaderboards(mockData);
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLeaderboard = (players) => (
    <div className="leaderboard-list">
      {players.map((player, index) => (
        <div key={player.id} className="leaderboard-item">
          <div className={`rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
            {index + 1}
          </div>
          <div className="player-info">
            <div className="player-name">{player.name}</div>
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
    <div className="container" style="padding-top: 32px;">
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
          gap: 12px;
        }
        
        .player-stats {
          text-align: right;
        }
        
        .stat-small {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
          .tabs {
            justify-content: center;
          }
          
          .tab {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
} 