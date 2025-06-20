import { useState, useEffect } from 'preact/hooks';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { route } from 'preact-router';

export default function GameLobby({ user }) {
  const [gameCode, setGameCode] = useState('');
  const [newGame, setNewGame] = useState({
    name: '',
    mode: 'deathmatch',
    maxPlayers: 4,
    map: 'dust_palace'
  });
  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(false);

  const gameModes = [
    { value: 'deathmatch', label: 'Deathmatch' },
    { value: 'team-vs-team', label: 'Team vs Team' },
    { value: 'battle-royale', label: 'Battle Royale' },
    { value: 'survival', label: 'Survival Mode' }
  ];

  const maps = [
    { value: 'dust_palace', label: 'Dust Palace' },
    { value: 'cyber_city', label: 'Cyber City' },
    { value: 'space_station', label: 'Space Station' },
    { value: 'jungle_warfare', label: 'Jungle Warfare' }
  ];

  useEffect(() => {
    if (!user) {
      route('/login');
      return;
    }
    loadActiveGames();
  }, [user]);

  const loadActiveGames = async () => {
    try {
      // Mock data - in real app, this would come from Firebase
      const mockGames = [
        {
          id: '1',
          name: 'Quick Match #1',
          mode: 'deathmatch',
          map: 'dust_palace',
          currentPlayers: 2,
          maxPlayers: 4,
          code: 'GAME01',
          host: 'ProGamer123',
          status: 'waiting'
        },
        {
          id: '2',
          name: 'Team Battle',
          mode: 'team-vs-team',
          map: 'cyber_city',
          currentPlayers: 3,
          maxPlayers: 6,
          code: 'TEAM42',
          host: 'SniperElite',
          status: 'waiting'
        }
      ];
      setActiveGames(mockGames);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const game = {
        name: newGame.name,
        mode: newGame.mode,
        map: newGame.map,
        maxPlayers: newGame.maxPlayers,
        currentPlayers: 1,
        code: gameCode,
        host: user.displayName,
        hostId: user.uid,
        players: [{
          uid: user.uid,
          name: user.displayName,
          joinedAt: new Date().toISOString()
        }],
        status: 'waiting',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'games'), game);
      
      alert(`Game created! Code: ${gameCode}\nShare this code with friends or present at reception.`);
      setNewGame({ name: '', mode: 'deathmatch', maxPlayers: 4, map: 'dust_palace' });
      loadActiveGames();
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = (code) => {
    alert(`Joining game with code: ${code}\nPresent this code at reception to start playing!`);
  };

  if (!user) return null;

  return (
    <div className="container" style="padding-top: 32px;">
      <h1>🎮 Game Lobby</h1>

      <div className="grid grid-2">
        {/* Create Game */}
        <div className="card">
          <h3>🆕 Create New Game</h3>
          <form onSubmit={handleCreateGame}>
            <div className="form-group">
              <label className="form-label">Game Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter game name"
                value={newGame.name}
                onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Game Mode</label>
              <select
                className="form-select"
                value={newGame.mode}
                onChange={(e) => setNewGame({...newGame, mode: e.target.value})}
              >
                {gameModes.map(mode => (
                  <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Map</label>
              <select
                className="form-select"
                value={newGame.map}
                onChange={(e) => setNewGame({...newGame, map: e.target.value})}
              >
                {maps.map(map => (
                  <option key={map.value} value={map.value}>{map.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Max Players</label>
              <select
                className="form-select"
                value={newGame.maxPlayers}
                onChange={(e) => setNewGame({...newGame, maxPlayers: parseInt(e.target.value)})}
              >
                <option value={2}>2 Players</option>
                <option value={4}>4 Players</option>
                <option value={6}>6 Players</option>
                <option value={8}>8 Players</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Game'}
            </button>
          </form>
        </div>

        {/* Join Game */}
        <div className="card">
          <h3>🔗 Join Game</h3>
          <div className="form-group">
            <label className="form-label">Game Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter game code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              style="text-align: center; font-size: 1.2rem; letter-spacing: 2px;"
            />
          </div>
          <button 
            className="btn btn-secondary btn-full"
            onClick={() => handleJoinGame(gameCode)}
            disabled={!gameCode}
          >
            Join Game
          </button>
        </div>
      </div>

      {/* Active Games */}
      <div className="card">
        <h3>🎯 Active Games</h3>
        {activeGames.length === 0 ? (
          <p style="text-align: center; color: var(--text-secondary); padding: 40px;">
            No active games available. Create one above!
          </p>
        ) : (
          <div className="games-grid">
            {activeGames.map(game => (
              <div key={game.id} className="game-card">
                <div className="game-header">
                  <h4>{game.name}</h4>
                  <span className="game-code">{game.code}</span>
                </div>
                <div className="game-details">
                  <div className="game-info">
                    <span>Mode: {gameModes.find(m => m.value === game.mode)?.label}</span>
                    <span>Map: {maps.find(m => m.value === game.map)?.label}</span>
                    <span>Host: {game.host}</span>
                  </div>
                  <div className="game-players">
                    <span>{game.currentPlayers}/{game.maxPlayers} players</span>
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-full"
                  onClick={() => handleJoinGame(game.code)}
                  disabled={game.currentPlayers >= game.maxPlayers}
                >
                  {game.currentPlayers >= game.maxPlayers ? 'Game Full' : 'Join Game'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .game-card {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 20px;
          background: var(--bg-light);
        }
        
        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .game-code {
          background: var(--primary-color);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1px;
        }
        
        .game-details {
          margin-bottom: 16px;
        }
        
        .game-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        .game-players {
          color: var(--primary-color);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
} 