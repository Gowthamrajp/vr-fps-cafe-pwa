import { useState, useEffect } from 'preact/hooks';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { route } from 'preact-router';

export default function Teams({ user }) {
  const [teams, setTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      route('/login');
      return;
    }
    loadTeams();
  }, [user]);

  const loadTeams = async () => {
    try {
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const teamsData = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsData);

      // Find user's team
      const userTeam = teamsData.find(team => 
        team.members?.some(member => member.uid === user.uid)
      );
      setMyTeam(userTeam);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'teams'), {
        name: teamName,
        description: teamDescription,
        leader: {
          uid: user.uid,
          name: user.displayName,
          phoneNumber: user.phoneNumber
        },
        members: [{
          uid: user.uid,
          name: user.displayName,
          phoneNumber: user.phoneNumber,
          role: 'leader',
          joinedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        stats: {
          wins: 0,
          losses: 0,
          totalKills: 0
        }
      });

      setTeamName('');
      setTeamDescription('');
      setShowCreateForm(false);
      loadTeams();
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style="padding-top: 32px;">
      <h1>👥 Teams & Clans</h1>

      {myTeam ? (
        <div className="card">
          <h3>🏆 My Team: {myTeam.name}</h3>
          <p>{myTeam.description}</p>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{myTeam.stats?.wins || 0}</div>
              <div className="stat-label">Wins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{myTeam.stats?.losses || 0}</div>
              <div className="stat-label">Losses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{myTeam.members?.length || 0}</div>
              <div className="stat-label">Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{myTeam.stats?.totalKills || 0}</div>
              <div className="stat-label">Total Kills</div>
            </div>
          </div>

          <h4>Team Members</h4>
          <div className="members-list">
            {myTeam.members?.map(member => (
              <div key={member.uid} className="member-item">
                <span className="member-name">{member.name}</span>
                <span className="member-role">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <h3>🆕 Create Your Team</h3>
          <p>Start your own team to compete with other players!</p>
          
          {!showCreateForm ? (
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create Team
            </button>
          ) : (
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  rows="3"
                />
              </div>
              
              <div style="display: flex; gap: 12px;">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="card">
        <h3>🔍 All Teams</h3>
        <div className="teams-grid">
          {teams.map(team => (
            <div key={team.id} className="team-card">
              <h4>{team.name}</h4>
              <p>{team.description}</p>
              <div className="team-stats">
                <span>Members: {team.members?.length || 0}</span>
                <span>W/L: {team.stats?.wins || 0}/{team.stats?.losses || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .members-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .member-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: var(--bg-light);
          border-radius: 8px;
        }
        
        .member-role {
          color: var(--primary-color);
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .teams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .team-card {
          padding: 20px;
          background: var(--bg-light);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }
        
        .team-stats {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
} 