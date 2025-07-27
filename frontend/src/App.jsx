import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  const [currentRoute, setCurrentRoute] = useState('/auth');
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [player, setPlayer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auth state
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Lobby state
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [rooms, setRooms] = useState([]);

  // Game state
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [myCards, setMyCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [turnMessage, setTurnMessage] = useState('');
  const [roundNumber, setRoundNumber] = useState(1);
  const [playedCards, setPlayedCards] = useState([]);
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, playing, hitting, revealing, finished
  const [hitCards, setHitCards] = useState([]);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    if (token && !socket) {
      const newSocket = io('http://localhost:5001', {
        auth: { token }
      });

      newSocket.on('authenticated', (data) => {
        setIsAuthenticated(true);
        setPlayer(data.player);
        setCurrentRoute('/lobby');
      });

      newSocket.on('connect_error', () => {
        setMessage('Authentication failed');
        setToken(null);
        localStorage.removeItem('token');
      });

      // Room events
      newSocket.on('room-success', (data) => {
        setMessage(data.message);
        setCurrentRoute('/room');
      });

      newSocket.on('room-error', (error) => {
        setMessage(error);
      });

      newSocket.on('room-update', (data) => {
        // Update room list or player count
        console.log('Room update:', data);
      });

      // Game events
      newSocket.on('game-started', (data) => {
        setGameStarted(true);
        setMyCards(data.yourCard);
        setGamePhase('playing');
        setRoundNumber(1);
      });

      newSocket.on('your-turn', (data) => {
        console.log('your-turn', data);
        setIsMyTurn(true);
        setTurnMessage(data.message);
        if (data.message.includes('Hit')) setGamePhase('hitting');
        if (data.yourCard) setMyCards(data.yourCard);
      });

      newSocket.on('not-your-turn', (data) => {
        console.log('not-your-turn', data);
        setIsMyTurn(false);
        setTurnMessage(data.message);
        if (data.message.includes('hit')) setGamePhase('hitting');
        if (data.yourCard) setMyCards(data.yourCard);
      });

      newSocket.on('card-played', (data) => {
        setPlayedCards(prev => [...prev, { player: data.playerName, card: data.playerCard }]);
      });

      newSocket.on('card-folded', (data) => {
        setPlayedCards(prev => [...prev, { player: data.playerName, card: 'folded' }]);
      });

      newSocket.on('round-winner', (data) => {
        setMessage(`${data.winnerPlayer} wins the round!`);
        setPlayedCards([]);
        setTimeout(() => setMessage(''), 2000);
      });

      newSocket.on('card-hit', (data) => {
        setHitCards(prev => [...prev, { player: data.playerName, ...data.playerCard }]);
        if (data.remainingPlayers) {
          setMessage(`Waiting for: ${data.remainingPlayers.join(', ')}`);
        }
      });

      newSocket.on('card-throw', (data) => {
        setHitCards(prev => [...prev, { player: data.playerName, ...data.playerCard }]);
        if (data.remainingPlayers) {
          setMessage(`Waiting for: ${data.remainingPlayers.join(', ')}`);
        }
      });

      newSocket.on('all-hit', (data) => {
        setMessage(data.message);
        setGamePhase('revealing');
      });

      newSocket.on('reveal-card', (data) => {
        setGamePhase('revealing');
        setMessage(data.message);
        // Update hit cards with revealed information
        const allRevealed = [data.winningHitCardPlayer, ...data.otherTongPlayer];
        setHitCards(allRevealed.map(p => ({
          player: p.name,
          cardHit: p.hitCard,
          cardUnder: p.revealedCard
        })));
      });

      newSocket.on('game-result', (data) => {
        setGameResult(data.gameWinner);
        setGamePhase('finished');
        setMessage(`${data.gameWinner.name} wins the game!`);
      });

      newSocket.on('game-error', (error) => {
        setMessage(error.message);
      });

      newSocket.on('card-error', (error) => {
        setMessage(error.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token]);

  const handleAuth = async (mode) => {
    setLoading(true);
    setMessage('');

    try {
      let endpoint = '';
      let body = {};

      if (mode === 'guest') {
        endpoint = '/auth/guest';
      } else if (mode === 'register') {
        endpoint = '/auth/register';
        body = { username, password };
      } else {
        endpoint = '/auth/login';
        body = { username, password };
      }

      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: mode === 'guest' ? undefined : JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.data.token);
        localStorage.setItem('token', data.data.token);
        setPlayer(data.data.player);
        setMessage('Authentication successful!');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = () => {
    if (socket && roomName.trim()) {
      socket.emit('create-room', roomName.trim());
    }
  };

  const joinRoom = () => {
    if (socket && roomId.trim()) {
      socket.emit('join-room', roomId.trim().toUpperCase());
    }
  };

  const startGame = () => {
    if (socket) {
      socket.emit('start-game');
    }
  };

  const playCard = (card) => {
    if (socket && isMyTurn) {
      socket.emit('play-card', card);
    }
  };

  const foldCard = (card) => {
    if (socket && isMyTurn) {
      socket.emit('fold-card', card);
    }
  };

  const hitCard = (card) => {
    if (socket) {
      socket.emit('hit-card', card);
    }
  };

  const throwCard = (card) => {
    if (socket) {
      socket.emit('throw-card', card);
    }
  };

  const showResult = () => {
    if (socket) {
      socket.emit('show-result');
    }
  };

  const restartGame = () => {
    setGameStarted(false);
    setGamePhase('waiting');
    setMyCards([]);
    setPlayedCards([]);
    setHitCards([]);
    setGameResult(null);
    setRoundNumber(1);
    setMessage('');
  };

  const getCardImage = (card) => {
    if (!card || card === 'folded') return '/assets/BACK.png';
    return `/assets/${card.suit}_${card.value}.png`;
  };

  const renderAuthPage = () => (
    <div className="min-h-screen bg-green-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-800">Catte Card Game</h1>
        
        <div className="flex mb-4">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 px-4 rounded-l ${authMode === 'login' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 px-4 rounded-r ${authMode === 'register' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Register
          </button>
        </div>

        {authMode !== 'guest' && (
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded mb-3"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded mb-4"
            />
            <button
              onClick={() => handleAuth(authMode)}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50 mb-3"
            >
              {loading ? 'Loading...' : authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </>
        )}

        <button
          onClick={() => handleAuth('guest')}
          disabled={loading}
          className="w-full bg-gray-600 text-white py-3 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Play as Guest
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded text-center ${message.includes('error') || message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );

  const renderLobbyPage = () => (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Game Lobby</h1>
          <p className="text-gray-600">Welcome, {player?.username}!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Create Room</h2>
            <input
              type="text"
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-3 border rounded mb-4"
            />
            <button
              onClick={createRoom}
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
            >
              Create Room
            </button>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Join Room</h2>
            <input
              type="text"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="w-full p-3 border rounded mb-4"
            />
            <button
              onClick={joinRoom}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
            >
              Join Room
            </button>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded text-center ${message.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );

  const renderGamePage = () => (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Catte Card Game</h1>
            <div className="flex gap-4">
              <span className="text-sm">Round: {roundNumber}</span>
              <span className="text-sm">Phase: {gamePhase}</span>
              {!gameStarted && (
                <button
                  onClick={startGame}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Start Game
                </button>
              )}
              {gamePhase === 'finished' && (
                <button
                  onClick={restartGame}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  New Game
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Game Table */}
        <div className="bg-green-600 rounded-lg p-8 mb-4 relative" style={{ minHeight: '600px' }}>
          {/* Center area - played cards or hit cards */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-green-700 rounded-lg p-4 min-w-64 min-h-32">
              {gamePhase === 'playing' && playedCards.length > 0 && (
                <div className="text-white text-center mb-2">Played Cards</div>
              )}
              {gamePhase === 'hitting' || gamePhase === 'revealing' ? (
                <div className="text-white text-center mb-2">Hit Cards</div>
              ) : null}
              
              <div className="flex flex-wrap gap-2 justify-center">
                {gamePhase === 'playing' && playedCards.map((play, index) => (
                  <div key={index} className="text-center">
                    <img
                      src={getCardImage(play.card)}
                      alt="card"
                      className="w-16 h-24 rounded shadow-lg"
                    />
                    <div className="text-white text-xs mt-1">{play.player}</div>
                  </div>
                ))}
                
                {(gamePhase === 'hitting' || gamePhase === 'revealing') && hitCards.map((hit, index) => (
                  <div key={index} className="text-center">
                    <div className="flex gap-1">
                      <div>
                        <img
                          src={getCardImage(hit.cardHit)}
                          alt="hit card"
                          className="w-16 h-24 rounded shadow-lg"
                        />
                        <div className="text-white text-xs">Hit</div>
                      </div>
                      {gamePhase === 'revealing' && (
                        <div>
                          <img
                            src={getCardImage(hit.cardUnder)}
                            alt="under card"
                            className="w-16 h-24 rounded shadow-lg"
                          />
                          <div className="text-white text-xs">Under</div>
                        </div>
                      )}
                    </div>
                    <div className="text-white text-xs mt-1">{hit.player}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Players around table - simplified to show current player at bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="text-white text-center mb-2">
              {player?.username} {isMyTurn ? '(Your Turn)' : ''}
            </div>
          </div>
        </div>

        {/* Player's Cards */}
        {gameStarted && myCards.length > 0 && (
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4">Your Cards</h3>
            <div className="flex gap-2 flex-wrap justify-center">
              {myCards.map((card, index) => (
                <div key={index} className="relative group">
                  <img
                    src={getCardImage(card)}
                    alt={`${card.suit} ${card.value}`}
                    className="w-20 h-28 rounded shadow-lg cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      if (gamePhase === 'playing' && isMyTurn) {
                        playCard(card);
                      } else if (gamePhase === 'hitting') {
                        hitCard(card);
                      }
                    }}
                  />
                  {gamePhase === 'playing' && isMyTurn && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button
                          onClick={() => playCard(card)}
                          className="bg-green-600 text-white px-2 py-1 text-xs rounded"
                        >
                          Play
                        </button>
                        <button
                          onClick={() => foldCard(card)}
                          className="bg-red-600 text-white px-2 py-1 text-xs rounded"
                        >
                          Fold
                        </button>
                      </div>
                    </div>
                  )}
                  {gamePhase === 'hitting' && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button
                          onClick={() => hitCard(card)}
                          className="bg-blue-600 text-white px-2 py-1 text-xs rounded"
                        >
                          Hit
                        </button>
                        <button
                          onClick={() => throwCard(card)}
                          className="bg-purple-600 text-white px-2 py-1 text-xs rounded"
                        >
                          Throw
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Messages */}
        {message && (
          <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 p-4">
            <p className="text-yellow-800">{message}</p>
          </div>
        )}

        {/* Turn Message */}
        {turnMessage && (
          <div className="mt-2 text-center text-white text-lg">
            {turnMessage}
          </div>
        )}

        {/* Show Result Button */}
        {gamePhase === 'revealing' && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={showResult}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700"
            >
              Show Result
            </button>
          </div>
        )}

        {/* Game Result */}
        {gameResult && (
          <div className="mt-4 bg-white rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Game Winner!</h2>
            <p className="text-xl">{gameResult.name} wins!</p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="text-center">
                <img
                  src={getCardImage(gameResult.hitCard)}
                  alt="winning hit card"
                  className="w-20 h-28 rounded shadow-lg mx-auto"
                />
                <p className="text-sm mt-1">Hit Card</p>
              </div>
              <div className="text-center">
                <img
                  src={getCardImage(gameResult.revealedCard)}
                  alt="winning revealed card"
                  className="w-20 h-28 rounded shadow-lg mx-auto"
                />
                <p className="text-sm mt-1">Under Card</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (currentRoute === '/auth') {
    return renderAuthPage();
  } else if (currentRoute === '/lobby') {
    return renderLobbyPage();
  } else if (currentRoute === '/room') {
    return renderGamePage();
  }

  return <div>Loading...</div>;
};

export default App;