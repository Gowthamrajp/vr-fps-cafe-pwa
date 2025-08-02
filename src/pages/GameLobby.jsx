import { useState, useEffect } from 'preact/hooks';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { route } from 'preact-router';

export default function GameLobby({ user }) {
  const [gameStep, setGameStep] = useState('create'); // 'create', 'setup', 'review', 'created'
  const [newGame, setNewGame] = useState({
    name: '',
    mode: 'team-deathmatch',
    maxPlayers: 6,
    map: 'dust_palace'
  });
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState('');
  const [gameConfig, setGameConfig] = useState(null);

  const gameModes = [
    { value: 'team-deathmatch', label: 'Team Deathmatch', teams: 2 },
    { value: 'capture-flag', label: 'Capture the Flag', teams: 2 },
    { value: 'battle-royale-teams', label: 'Battle Royale Teams', teams: 3 },
    { value: 'free-for-all', label: 'Free for All', teams: 0 },
    { value: 'king-of-hill', label: 'King of the Hill', teams: 2 }
  ];

  const maps = [
    { value: 'dust_palace', label: 'Dust Palace' },
    { value: 'cyber_city', label: 'Cyber City' },
    { value: 'space_station', label: 'Space Station' },
    { value: 'jungle_warfare', label: 'Jungle Warfare' },
    { value: 'neon_arena', label: 'Neon Arena' },
    { value: 'industrial_complex', label: 'Industrial Complex' }
  ];

  useEffect(() => {
    if (!user) {
      route('/login');
      return;
    }
  }, [user]);

  const getSelectedGameMode = () => {
    return gameModes.find(mode => mode.value === newGame.mode);
  };

  const handleCreateGameSetup = (e) => {
    e.preventDefault();
    setGameStep('setup');
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < newGame.maxPlayers) {
      const newPlayer = {
        name: newPlayerName.trim(),
        teamid: 0, // Default to team 0
        id: Date.now().toString()
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (playerId) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const assignPlayerToTeam = (playerId, teamId) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, teamid: teamId } : p
    ));
  };

  const autoAssignTeams = () => {
    const gameMode = getSelectedGameMode();
    if (!gameMode || gameMode.teams === 0) return;

    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const updatedPlayers = shuffledPlayers.map((player, index) => ({
      ...player,
      teamid: index % gameMode.teams
    }));
    setPlayers(updatedPlayers);
  };

  const getTeamPlayers = (teamId) => {
    return players.filter(p => p.teamid === teamId);
  };

  const validateTeams = () => {
    const gameMode = getSelectedGameMode();
    if (!gameMode || gameMode.teams === 0) return true;

    for (let i = 0; i < gameMode.teams; i++) {
      if (getTeamPlayers(i).length === 0) {
        return false;
      }
    }
    return true;
  };

  const proceedToReview = () => {
    if (players.length < 2) {
      alert('Please add at least 2 players to start the game.');
      return;
    }

    const gameMode = getSelectedGameMode();
    if (gameMode && gameMode.teams > 0 && !validateTeams()) {
      alert('Please ensure all teams have at least one player.');
      return;
    }

    setGameStep('review');
  };

  const generateGameConfig = () => {
    const gameMode = getSelectedGameMode();
    
    return {
      mode: gameMode.teams > 0 ? gameMode.teams : 0, // Number of teams or 0 for free-for-all
      gameMode: newGame.mode,
      map: newGame.map,
      maxPlayers: newGame.maxPlayers,
      totalPlayers: players.length,
      players: players.map(p => ({
        name: p.name,
        teamid: p.teamid
      })),
      teams: gameMode.teams > 0 ? 
        Array.from({ length: gameMode.teams }, (_, i) => ({
          id: i,
          players: getTeamPlayers(i).map(p => p.name)
        })) : [],
      settings: {
        gameName: newGame.name,
        createdAt: new Date().toISOString(),
        captain: user.displayName,
        captainId: user.uid
      }
    };
  };

  const handleCreateGame = async () => {
    setLoading(true);
    
    try {
      const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const config = generateGameConfig();
      
      const game = {
        name: newGame.name,
        mode: newGame.mode,
        map: newGame.map,
        maxPlayers: newGame.maxPlayers,
        totalPlayers: players.length,
        code: gameCode,
        captain: user.displayName,
        captainId: user.uid,
        players: players,
        config: config,
        status: 'ready',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'games'), game);
      
      setGameId(gameCode);
      setGameConfig(config);
      setGameStep('created');
      
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startNewGame = () => {
    setGameStep('create');
    setNewGame({
      name: '',
      mode: 'team-deathmatch',
      maxPlayers: 6,
      map: 'dust_palace'
    });
    setPlayers([]);
    setGameId('');
    setGameConfig(null);
  };

  if (!user) return null;

  return (
    <div className="container main-content" style="padding-top: 32px;">
      <h1>🎮 Game Lobby</h1>

      {gameStep === 'create' && (
        <div className="card">
          <h3>🆕 Create New Game</h3>
          <form onSubmit={handleCreateGameSetup}>
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
                  <option key={mode.value} value={mode.value}>
                    {mode.label} {mode.teams > 0 && `(${mode.teams} Teams)`}
                  </option>
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
                <option value={10}>10 Players</option>
                <option value={12}>12 Players</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              Next: Add Players
            </button>
          </form>
        </div>
      )}

      {gameStep === 'setup' && (
        <div className="card">
          <h3>👥 Add Players & Assign Teams</h3>
          <div style="margin-bottom: 20px;">
            <p><strong>Game:</strong> {newGame.name}</p>
            <p><strong>Mode:</strong> {getSelectedGameMode()?.label}</p>
            <p><strong>Map:</strong> {maps.find(m => m.value === newGame.map)?.label}</p>
            <p><strong>Captain:</strong> {user.displayName}</p>
          </div>

          <div className="form-group">
            <label className="form-label">Add Player</label>
            <div style="display: flex; gap: 10px;">
              <input
                type="text"
                className="form-input"
                placeholder="Player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                style="flex: 1;"
              />
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={addPlayer}
                disabled={players.length >= newGame.maxPlayers}
              >
                Add
              </button>
            </div>
            <small>Players: {players.length}/{newGame.maxPlayers}</small>
          </div>

          {getSelectedGameMode()?.teams > 0 && (
            <div style="margin: 20px 0;">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={autoAssignTeams}
                disabled={players.length === 0}
              >
                🔀 Auto Assign Teams
              </button>
            </div>
          )}

          {players.length > 0 && (
            <div className="players-list">
              <h4>Players ({players.length})</h4>
              {getSelectedGameMode()?.teams > 0 ? (
                // Team-based view
                Array.from({ length: getSelectedGameMode().teams }, (_, teamId) => (
                  <div key={teamId} className="team-section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 8px;">
                    <h5>Team {teamId + 1} ({getTeamPlayers(teamId).length} players)</h5>
                    {getTeamPlayers(teamId).map(player => (
                      <div key={player.id} className="player-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 5px 0; background: #f5f5f5; border-radius: 4px;">
                        <span>{player.name}</span>
                        <div>
                          <select
                            value={player.teamid}
                            onChange={(e) => assignPlayerToTeam(player.id, parseInt(e.target.value))}
                            style="margin-right: 10px;"
                          >
                            {Array.from({ length: getSelectedGameMode().teams }, (_, i) => (
                              <option key={i} value={i}>Team {i + 1}</option>
                            ))}
                          </select>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => removePlayer(player.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Show unassigned players in team 0 section */}
                    {teamId === 0 && players.filter(p => p.teamid === teamId).length === 0 && (
                      <p style="color: #999; font-style: italic;">No players assigned</p>
                    )}
                  </div>
                ))
              ) : (
                // Free-for-all view
                <div>
                  {players.map(player => (
                    <div key={player.id} className="player-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 5px 0; background: #f5f5f5; border-radius: 4px;">
                      <span>{player.name}</span>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => removePlayer(player.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button 
              className="btn btn-secondary" 
              onClick={() => setGameStep('create')}
            >
              Back
            </button>
            <button 
              className="btn btn-primary btn-full" 
              onClick={proceedToReview}
              disabled={players.length < 2}
            >
              Review & Create Game
            </button>
          </div>
        </div>
      )}

      {gameStep === 'review' && (
        <div className="card">
          <h3>📋 Review Game Setup</h3>
          
          <div style="margin-bottom: 20px;">
            <h4>Game Details</h4>
            <p><strong>Name:</strong> {newGame.name}</p>
            <p><strong>Mode:</strong> {getSelectedGameMode()?.label}</p>
            <p><strong>Map:</strong> {maps.find(m => m.value === newGame.map)?.label}</p>
            <p><strong>Captain:</strong> {user.displayName}</p>
            <p><strong>Total Players:</strong> {players.length}</p>
          </div>

          {getSelectedGameMode()?.teams > 0 ? (
            <div>
              <h4>Team Composition</h4>
              {Array.from({ length: getSelectedGameMode().teams }, (_, teamId) => (
                <div key={teamId} style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 5px;">
                  <strong>Team {teamId + 1}:</strong> {getTeamPlayers(teamId).map(p => p.name).join(', ')}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <h4>Players</h4>
              <p>{players.map(p => p.name).join(', ')}</p>
            </div>
          )}

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button 
              className="btn btn-secondary" 
              onClick={() => setGameStep('setup')}
            >
              Back to Edit
            </button>
            <button 
              className="btn btn-primary btn-full" 
              onClick={handleCreateGame}
              disabled={loading}
            >
              {loading ? 'Creating Game...' : '🚀 Create Game'}
            </button>
          </div>
        </div>
      )}

      {gameStep === 'created' && gameConfig && (
        <div className="card">
          <h3>🎉 Game Created Successfully!</h3>
          
          <div className="game-id-display" style="text-align: center; margin: 30px 0;">
            <h2 style="color: #4CAF50; font-size: 2.5rem; margin: 10px 0;">
              Game ID: {gameId}
            </h2>
            <p style="font-size: 1.2rem; color: #666;">
              Give this ID to the game operator to start the VR session
            </p>
          </div>

          <div className="config-summary" style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4>Game Configuration</h4>
            <pre style="background: #fff; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px;">
{JSON.stringify(gameConfig, null, 2)}
            </pre>
          </div>

          <div className="action-buttons" style="display: flex; gap: 10px; margin-top: 20px;">
            <button 
              className="btn btn-primary btn-full" 
              onClick={startNewGame}
            >
              Create Another Game
            </button>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;">
            <h4>📱 Next Steps:</h4>
            <ol>
              <li>Give the Game ID <strong>{gameId}</strong> to the VR game operator</li>
              <li>The operator will use this ID to load the game configuration</li>
              <li>Players should get ready for their VR FPS session!</li>
              <li>Game configuration is stored and ready for the VR engine</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
} 