# VR FPS Game Cafe PWA

A Progressive Web Application for managing VR FPS gaming sessions, built with Preact and Firebase.

## Features

- 🔐 **Phone OTP Authentication** - Secure login with mobile number verification
- 👤 **User Profiles** - Complete profile management with school/college info
- 👥 **Teams & Clans** - Create and manage gaming teams
- 📊 **Statistics Tracking** - Individual player stats and achievements
- 📅 **Booking System** - Reserve gaming sessions with payment integration
- 🎮 **Game Lobby** - Create and join games with unique codes
- 🏆 **Leaderboards** - Multiple leaderboards (overall, school, college, area)
- 🎁 **Referral System** - Reward system for user referrals
- 📱 **PWA Support** - Installable on mobile devices
- 🎨 **Modern UI** - Beautiful, responsive design

## Tech Stack

- **Frontend**: Preact, Preact Router
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Build Tool**: Vite
- **Styling**: CSS Custom Properties, Flexbox, Grid

## Setup Instructions

### Prerequisites

- Node.js 16+ installed
- Firebase account and project
- Git installed

### 1. Clone Repository

```bash
git clone <repository-url>
cd vr-fps-cafe-pwa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Phone Number provider
3. Enable Firestore Database
4. Enable Storage
5. Copy your Firebase config and update `src/services/firebase.js`

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

### 6. Deploy to Firebase Hosting (Optional)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── Navbar.jsx      # Navigation bar
├── pages/              # Page components
│   ├── Home.jsx        # Dashboard
│   ├── Login.jsx       # Authentication
│   ├── Profile.jsx     # User profile
│   ├── Teams.jsx       # Team management
│   ├── Booking.jsx     # Session booking
│   ├── Leaderboard.jsx # Rankings
│   ├── GameLobby.jsx   # Game creation/joining
│   └── Stats.jsx       # Player statistics
├── services/           
│   └── firebase.js     # Firebase configuration
├── app.jsx             # Main app component
├── main.jsx            # Entry point
└── style.css           # Global styles
```

## Firebase Collections Structure

### Users Collection
```javascript
{
  uid: "user-id",
  name: "User Name",
  phoneNumber: "+1234567890",
  pincode: "123456",
  school: "School Name",
  college: "College Name",
  stats: {
    kills: 0,
    matches: 0,
    wins: 0,
    playTime: 0
  },
  createdAt: "timestamp",
  freePlayTime: 0
}
```

### Teams Collection
```javascript
{
  name: "Team Name",
  description: "Team Description",
  leader: { uid, name, phoneNumber },
  members: [{ uid, name, role, joinedAt }],
  stats: { wins: 0, losses: 0, totalKills: 0 },
  createdAt: "timestamp"
}
```

### Bookings Collection
```javascript
{
  userId: "user-id",
  userName: "User Name",
  date: "2024-01-01",
  time: "15:00",
  duration: 2,
  playerCount: 4,
  gameMode: "deathmatch",
  totalAmount: 1200,
  gameCode: "GAME123",
  status: "pending",
  createdAt: "timestamp"
}
```

### Games Collection
```javascript
{
  name: "Game Name",
  mode: "deathmatch",
  map: "dust_palace",
  maxPlayers: 4,
  currentPlayers: 2,
  code: "GAME123",
  host: "Host Name",
  players: [{ uid, name, joinedAt }],
  status: "waiting",
  createdAt: "timestamp"
}
```

## Features in Detail

### Authentication
- Phone number verification with OTP
- Profile creation with referral code support
- Secure session management

### Booking System
- Multiple game modes and maps
- Dynamic pricing calculation
- Game code generation for reception

### Team Management
- Create/join teams
- Team statistics tracking
- Member role management

### Statistics
- Individual player tracking
- Achievement system
- Performance analytics

### Leaderboards
- Overall rankings
- School/college specific boards
- Area-based competitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please contact the development team or create an issue in the repository. 