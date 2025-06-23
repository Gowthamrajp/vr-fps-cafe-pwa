import { useState, useEffect } from 'preact/hooks';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { route } from 'preact-router';

export default function GameLobby({ user }) {
  const [newGame, setNewGame] = useState({
    name: '',
    mode: 'deathmatch',
    maxPlayers: 4,
    map: 'dust_palace'
  });
  const [loading, setLoading] = useState(false);

  const gameModes = [
    { value: 'deathmatch', label: 'Deathmatch' },
    { value: 'battle-royale', label: 'Battle Royale' },
    { value: 'survival', label: 'Survival Mode' },
    { value: 'free-for-all', label: 'Free for All' }
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
  }, [user]);

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
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  if (!user) return null;

  return (
    <div className="container main-content" style="padding-top: 32px;">
      <h1>🎮 Game Lobby</h1>

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


    </div>
  );
} 