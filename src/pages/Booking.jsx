import { useState, useEffect } from 'preact/hooks';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { route } from 'preact-router';

export default function Booking({ user }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [playerCount, setPlayerCount] = useState(1);
  const [gameMode, setGameMode] = useState('deathmatch');
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const gameModes = [
    { value: 'deathmatch', label: 'Deathmatch', price: 300 },
    { value: 'team-vs-team', label: 'Team vs Team', price: 350 },
    { value: 'battle-royale', label: 'Battle Royale', price: 400 },
    { value: 'survival', label: 'Survival Mode', price: 320 }
  ];

  useEffect(() => {
    if (!user) {
      route('/login');
      return;
    }
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [user]);

  const calculateTotal = () => {
    const basePrice = gameModes.find(mode => mode.value === gameMode)?.price || 300;
    return basePrice * duration * playerCount;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const booking = {
        userId: user.uid,
        userName: user.displayName,
        userPhone: user.phoneNumber,
        date: selectedDate,
        time: selectedTime,
        duration,
        playerCount,
        gameMode,
        totalAmount: calculateTotal(),
        status: 'pending',
        gameCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'bookings'), booking);
      
      alert(`Booking confirmed! Your game code is: ${booking.gameCode}\nPresent this code at reception.`);
      route('/');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style="max-width: 600px; padding-top: 32px;">
      <div className="card">
        <h2>📅 Book Your VR Session</h2>
        
        <form onSubmit={handleBooking}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Slot</label>
              <select
                className="form-select"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
              >
                <option value="">Select Time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (hours)</label>
              <select
                className="form-select"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours</option>
                <option value={3}>3 Hours</option>
                <option value={4}>4 Hours</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Players</label>
              <select
                className="form-select"
                value={playerCount}
                onChange={(e) => setPlayerCount(parseInt(e.target.value))}
              >
                <option value={1}>1 Player</option>
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Game Mode</label>
            <div className="game-modes">
              {gameModes.map(mode => (
                <div key={mode.value} className="game-mode-option">
                  <input
                    type="radio"
                    id={mode.value}
                    name="gameMode"
                    value={mode.value}
                    checked={gameMode === mode.value}
                    onChange={(e) => setGameMode(e.target.value)}
                  />
                  <label htmlFor={mode.value} className="game-mode-label">
                    <span className="mode-name">{mode.label}</span>
                    <span className="mode-price">₹{mode.price}/hr/player</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-item">
              <span>Date & Time:</span>
              <span>{selectedDate} at {selectedTime}</span>
            </div>
            <div className="summary-item">
              <span>Duration:</span>
              <span>{duration} hour(s)</span>
            </div>
            <div className="summary-item">
              <span>Players:</span>
              <span>{playerCount}</span>
            </div>
            <div className="summary-item">
              <span>Game Mode:</span>
              <span>{gameModes.find(m => m.value === gameMode)?.label}</span>
            </div>
            <div className="summary-total">
              <span>Total Amount:</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Processing...' : `Pay ₹${calculateTotal()} & Book Session`}
          </button>
        </form>
      </div>

      <style jsx>{`
        .game-modes {
          display: grid;
          gap: 12px;
        }
        
        .game-mode-option {
          display: flex;
          align-items: center;
        }
        
        .game-mode-label {
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          margin-left: 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .game-mode-option input:checked + .game-mode-label {
          border-color: var(--primary-color);
          background: rgba(102, 126, 234, 0.1);
        }
        
        .mode-price {
          color: var(--primary-color);
          font-weight: 600;
        }
        
        .booking-summary {
          background: var(--bg-light);
          padding: 20px;
          border-radius: var(--border-radius);
          margin: 24px 0;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .summary-total {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--primary-color);
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
} 