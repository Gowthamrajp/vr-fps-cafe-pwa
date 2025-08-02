import { useState } from 'preact/hooks';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function GameLookup() {
  const [gameId, setGameId] = useState('');
  const [gameConfig, setGameConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupGame = async (e) => {
    e.preventDefault();
    if (!gameId.trim()) return;

    setLoading(true);
    setError('');
    setGameConfig(null);

    try {
      const gamesRef = collection(db, 'games');
      const q = query(gamesRef, where('code', '==', gameId.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Game not found. Please check the Game ID.');
        return;
      }

      const gameDoc = querySnapshot.docs[0];
      const gameData = gameDoc.data();
      
      if (gameData.status !== 'ready') {
        setError('Game is not ready yet. Please wait for the captain to finish setup.');
        return;
      }

      setGameConfig(gameData);
    } catch (err) {
      console.error('Error looking up game:', err);
      setError('Error looking up game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyConfigToClipboard = () => {
    if (gameConfig?.config) {
      navigator.clipboard.writeText(JSON.stringify(gameConfig.config, null, 2));
      alert('Game configuration copied to clipboard!');
    }
  };

  const downloadConfig = () => {
    if (gameConfig?.config) {
      const dataStr = JSON.stringify(gameConfig.config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `game-config-${gameConfig.code}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="container main-content" style="padding-top: 32px;">
      <h1>🔍 Game Lookup</h1>
      <p>Enter a Game ID to retrieve the configuration for the VR game engine.</p>

      <div className="card">
        <h3>🎮 Look Up Game Configuration</h3>
        
        <form onSubmit={lookupGame}>
          <div className="form-group">
            <label className="form-label">Game ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter 6-character Game ID (e.g., ABC123)"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              maxLength={6}
              style="text-transform: uppercase; font-family: monospace; font-size: 1.2rem; text-align: center;"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading || !gameId.trim()}
          >
            {loading ? 'Looking up...' : 'Look Up Game'}
          </button>
        </form>

        {error && (
          <div className="error-message" style="margin-top: 20px; padding: 15px; background: #ffebee; color: #c62828; border-radius: 5px;">
            {error}
          </div>
        )}

        {gameConfig && (
          <div className="game-details" style="margin-top: 30px;">
            <h3>🎯 Game Found!</h3>
            
            <div className="game-info" style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4>Game Information</h4>
              <p><strong>Name:</strong> {gameConfig.name}</p>
              <p><strong>Mode:</strong> {gameConfig.mode}</p>
              <p><strong>Map:</strong> {gameConfig.map}</p>
              <p><strong>Captain:</strong> {gameConfig.captain}</p>
              <p><strong>Total Players:</strong> {gameConfig.totalPlayers}</p>
              <p><strong>Created:</strong> {new Date(gameConfig.createdAt).toLocaleString()}</p>
            </div>

            {gameConfig.config?.teams?.length > 0 && (
              <div className="team-info" style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4>Team Composition</h4>
                {gameConfig.config.teams.map((team, index) => (
                  <div key={team.id} style="margin-bottom: 10px;">
                    <strong>Team {team.id + 1}:</strong> {team.players.join(', ')}
                  </div>
                ))}
              </div>
            )}

            <div className="config-display" style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4>🔧 VR Engine Configuration</h4>
              <pre style="background: #fff; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px; max-height: 400px; overflow-y: auto;">
{JSON.stringify(gameConfig.config, null, 2)}
              </pre>
              
              <div className="config-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                <button 
                  className="btn btn-secondary" 
                  onClick={copyConfigToClipboard}
                >
                  📋 Copy Config
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={downloadConfig}
                >
                  💾 Download JSON
                </button>
              </div>
            </div>

            <div className="operator-instructions" style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4>🎮 Instructions for VR Operator</h4>
              <ol>
                <li><strong>Load Configuration:</strong> Use the JSON configuration above in your VR game engine</li>
                <li><strong>Verify Teams:</strong> Check that all players are assigned to correct teams</li>
                <li><strong>Set Up Hardware:</strong> Prepare {gameConfig.totalPlayers} VR headsets</li>
                <li><strong>Launch Game:</strong> Start {gameConfig.mode} on {gameConfig.map}</li>
                <li><strong>Brief Players:</strong> Explain team assignments and game objectives</li>
              </ol>
            </div>

            <div className="quick-reference" style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4>📊 Quick Reference</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                  <strong>Game Mode:</strong><br />
                  {gameConfig.mode}
                </div>
                <div>
                  <strong>Map:</strong><br />
                  {gameConfig.map}
                </div>
                <div>
                  <strong>Players:</strong><br />
                  {gameConfig.totalPlayers}
                </div>
                <div>
                  <strong>Teams:</strong><br />
                  {gameConfig.config?.teams?.length || 'Free-for-all'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 