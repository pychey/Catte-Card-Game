// App.jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function App() {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [yourCard, setYourCard] = useState(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [result, setResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    socket.on('room-update', (names) => {
      setPlayers(names);
    });

    socket.on('game-started', (data) => {
      setYourCard(data.yourCard);
    });

    socket.on('game-result', (data) => {
      setResult(data);
      setGameOver(true);
    });

    socket.on('go-home', () => {
      resetToHome();
    });

    return () => {
      socket.off('room-update');
      socket.off('game-started');
      socket.off('game-result');
      socket.off('go-home');
    };
  }, []);

  const joinRoom = () => {
    if (!roomId || !playerName) return;
    socket.emit('join-room', { roomId, playerName });
    setJoined(true);
  };

  const playCard = () => {
    socket.emit('play-card', { roomId });
    setHasPlayed(true);
  };

  const resetToHome = () => {
    setRoomId('');
    setPlayerName('');
    setJoined(false);
    setPlayers([]);
    setYourCard(null);
    setHasPlayed(false);
    setResult(null);
    setGameOver(false);
  };

  const handleReset = () => {
    socket.emit('reset', roomId);
  };

  return (
    <div style={{ padding: 20 }}>
      {!joined ? (
        <div>
          <h2>Join Room</h2>
          <input
            placeholder="Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Room: {roomId}</h2>
          <h4>Players: {players.join(', ')}</h4>

          {yourCard && !gameOver && (
            <>
              <p>Your card: {yourCard.value}{yourCard.suit}</p>
              {!hasPlayed ? (
                <button onClick={playCard}>Play Card</button>
              ) : (
                <p>Waiting for opponent...</p>
              )}
            </>
          )}

          {gameOver && result && (
            <>
              <h3>🎉 Game Over</h3>
              <ul>
                {result.cards.map((p, i) => (
                  <li key={p.id}>
                    Player {i + 1}: {p.card.value}{p.card.suit}
                  </li>
                ))}
              </ul>
              <h4>Winner: {result.winner}</h4>
              <button onClick={handleReset}>Return to Home</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
