# Team-Based Game Lobby System

This document explains how to use the enhanced Game Lobby system for creating team-based VR FPS games with captain functionality.

## 🎮 How It Works

### For Players (Captains)

1. **Create Game** (`/game-lobby`)
   - Enter game name, select mode, map, and max players
   - Choose from team-based modes or free-for-all

2. **Add Players**
   - Add player names manually
   - Assign players to teams (for team-based modes)
   - Use "Auto Assign Teams" for random distribution

3. **Review & Create**
   - Review all game settings and team compositions
   - Click "Create Game" to generate unique Game ID

4. **Get Game ID**
   - Receive 6-character Game ID (e.g., `ABC123`)
   - Give this ID to the VR game operator

### For Game Operators

1. **Look Up Game** (`/game-lookup`)
   - Enter the 6-character Game ID
   - View complete game configuration
   - Copy or download JSON configuration

2. **Load in VR Engine**
   - Use the JSON configuration to set up the VR game
   - Configure teams, players, and game settings

## 📋 Game Configuration Format

When a game is created, it generates a JSON configuration like this:

```json
{
  "mode": 2,
  "gameMode": "team-deathmatch",
  "map": "dust_palace",
  "maxPlayers": 6,
  "totalPlayers": 6,
  "players": [
    {"name": "Ashwin", "teamid": 0},
    {"name": "Sanjay", "teamid": 1},
    {"name": "Priya", "teamid": 0},
    {"name": "Raj", "teamid": 1},
    {"name": "Maya", "teamid": 0},
    {"name": "Kiran", "teamid": 1}
  ],
  "teams": [
    {"id": 0, "players": ["Ashwin", "Priya", "Maya"]},
    {"id": 1, "players": ["Sanjay", "Raj", "Kiran"]}
  ],
  "settings": {
    "gameName": "Epic Battle",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "captain": "Player Name",
    "captainId": "uid123"
  }
}
```

## 🎯 Game Modes

### Team-Based Modes
- **Team Deathmatch** - 2 teams compete for most kills
- **Capture the Flag** - 2 teams try to capture opponent's flag
- **King of the Hill** - 2 teams fight for map control
- **Battle Royale Teams** - 3 teams in battle royale format

### Individual Modes
- **Free for All** - Every player for themselves
- No teams assigned (all players have `teamid: 0`)

## 🔧 VR Engine Integration

### Reading the Configuration

```javascript
// Example: Using the config in a VR game engine
const gameConfig = JSON.parse(configJson);

// Set up teams
gameConfig.teams.forEach(team => {
  createTeam(team.id, team.players);
});

// Configure game mode
setGameMode(gameConfig.gameMode);
setMap(gameConfig.map);

// Start game with players
gameConfig.players.forEach(player => {
  assignPlayerToTeam(player.name, player.teamid);
});
```

### Key Configuration Properties

- `mode`: Number of teams (0 = free-for-all)
- `gameMode`: Specific game mode string
- `map`: Map identifier
- `players`: Array of player objects with names and team assignments
- `teams`: Array of team objects with member lists
- `totalPlayers`: Total number of players

## 📱 User Interface Flow

### Captain's Flow
1. **Start Game** → 2. **Add Players** → 3. **Assign Teams** → 4. **Review** → 5. **Get Game ID**

### Operator's Flow
1. **Enter Game ID** → 2. **View Configuration** → 3. **Copy/Download JSON** → 4. **Load in VR Engine**

## 🔍 Game Lookup Features

- **Public Access**: No login required for operators
- **Real-time Lookup**: Instant configuration retrieval
- **Multiple Formats**: View, copy, or download JSON
- **Operator Instructions**: Step-by-step setup guide
- **Team Visualization**: Clear team composition display

## 🚀 Deployment

The system is live at:
- **Game Creation**: https://fps-vr.web.app/game-lobby
- **Game Lookup**: https://fps-vr.web.app/game-lookup

## 📊 Database Structure

Game documents are stored in Firestore with this structure:

```javascript
{
  name: "Game Name",
  mode: "team-deathmatch",
  map: "dust_palace",
  code: "ABC123", // 6-character unique ID
  captain: "Captain Name",
  captainId: "firebase-uid",
  players: [/* player objects */],
  config: {/* full game configuration */},
  status: "ready",
  createdAt: "timestamp"
}
```

## 🔒 Security

- Game configurations are publicly readable by Game ID
- Only authenticated users can create games
- Game IDs are unique and hard to guess
- No sensitive user data in game configurations

## 🎪 Example Usage

1. **Captain creates team game**:
   - "Epic Battle" with 6 players
   - Team Deathmatch on Dust Palace
   - 3 vs 3 teams

2. **System generates Game ID**: `XYZ789`

3. **Operator enters ID**: Gets full JSON config

4. **VR Engine loads**: 
   - 6 players in 2 teams
   - Team Deathmatch mode
   - Dust Palace map

The system bridges the gap between game planning and VR execution with a seamless ID-based handoff! 