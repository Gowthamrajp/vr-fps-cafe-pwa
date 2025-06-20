import { useState, useEffect } from 'preact/hooks';
import Router from 'preact-router';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Teams from './pages/Teams';
import Booking from './pages/Booking';
import Leaderboard from './pages/Leaderboard';
import GameLobby from './pages/GameLobby';
import Stats from './pages/Stats';

export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo mode first
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
      setLoading(false);
      return;
    }

    // Otherwise use Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div id="app">
      {user && <Navbar user={user} />}
      <Router>
        <Home path="/" user={user} />
        <Login path="/login" />
        <Profile path="/profile" user={user} />
        <Teams path="/teams" user={user} />
        <Booking path="/booking" user={user} />
        <Leaderboard path="/leaderboard" user={user} />
        <GameLobby path="/game-lobby" user={user} />
        <Stats path="/stats" user={user} />
      </Router>
    </div>
  );
} 