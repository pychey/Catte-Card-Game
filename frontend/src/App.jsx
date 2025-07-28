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
  const [roundNumber, setRoundNumber] = useState(undefined);
  const [playedCards, setPlayedCards] = useState([]);
  const [gamePhase, setGamePhase] = useState('Waiting'); // Waiting, Playing, Hitting, Revealing, Finished
  const [hitCards, setHitCards] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState('profile');
  const [playerHistory, setPlayerHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);

  //convert guest to player
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertUsername, setConvertUsername] = useState('');
  const [convertPassword, setConvertPassword] = useState('');
  const [convertLoading, setConvertLoading] = useState(false);

  useEffect(() => {
    if (token && !socket) {
      const newSocket = io('http://localhost:5001', {
        auth: { token },
      });

      newSocket.on('authenticated', (data) => {
        setIsAuthenticated(true);
        setPlayer(data.player);
        setCurrentRoute('/lobby');
        setTimeout(() => {
          newSocket.emit('get-active-rooms');
        }, 100);
      });

      newSocket.on('connect_error', () => {
        setMessage('Authentication failed');
        setToken(null);
        localStorage.removeItem('token');
      });

      // Room events
      newSocket.on('room-success', (data) => {
        setRoomId(data.roomId);
        setMessage(data.message);
        if (data.message.includes('Left room')) {
          setCurrentRoute('/lobby');
          restartGame();
          setPlayers([]);
          setRoom(null);
          setRoomName(null);
          setRoomId(null);
          setTimeout(() => {
            newSocket.emit('get-active-rooms');
          }, 100);
        } else {
          setCurrentRoute('/room');
          newSocket.emit('get-room-info');
        }
      });

      newSocket.on('room-error', (error) => {
        setMessage(error);
      });

      newSocket.on('room-update', (data) => {
        console.log('Room update:', data);
      });

      newSocket.on('room-players', (data) => {
        setPlayers(data.players);
      });

      newSocket.on('player-joined', (data) => {
        setPlayers((prev) => [...prev, data.player]);
      });

      newSocket.on('player-left', (data) => {
        setPlayers((prev) => prev.filter((p) => p.playerId !== data.playerId));
      });

      newSocket.on('game-reset', (data) => {
        restartGame();
        setMessage(data.message);
      });

      // Game events
      newSocket.on('game-started', (data) => {
        setGameResult(null);
        setGameStarted(true);
        setMyCards(data.yourCard);
        setGamePhase('Playing');
        setRoundNumber(1);
      });

      newSocket.on('game-restarted', () => {
        restartGame();
      });

      newSocket.on('your-turn', (data) => {
        console.log('your-turn', data);
        setIsMyTurn(true);
        setTurnMessage(data.message);
        if (data.message.includes('Hit')) setGamePhase('Hitting');
        if (data.yourCard) setMyCards(data.yourCard);
      });

      newSocket.on('not-your-turn', (data) => {
        console.log('not-your-turn', data);
        setIsMyTurn(false);
        setTurnMessage(data.message);
        if (data.message.includes('hit')) setGamePhase('Hitting');
        if (data.yourCard) setMyCards(data.yourCard);
      });

      newSocket.on('card-played', (data) => {
        setPlayedCards((prev) => [
          ...prev,
          { player: data.playerName, card: data.playerCard },
        ]);
      });

      newSocket.on('card-folded', (data) => {
        setPlayedCards((prev) => [
          ...prev,
          { player: data.playerName, card: 'folded' },
        ]);
      });

      newSocket.on('card-removed', (data) => {
        if (data.yourCard) setMyCards(data.yourCard);
      });

      newSocket.on('round-winner', (data) => {
        setRoundNumber((prev) => prev + 1);
      });

      newSocket.on('card-hit', (data) => {
        setHitCards((prev) => [
          ...prev,
          { player: data.playerName, ...data.playerCard },
        ]);
        if (data.remainingPlayers) {
          setMessage(`Waiting for: ${data.remainingPlayers.join(', ')}`);
        }
      });

      newSocket.on('card-throw', (data) => {
        setHitCards((prev) => [
          ...prev,
          { player: data.playerName, ...data.playerCard },
        ]);
        if (data.remainingPlayers) {
          setMessage(`Waiting for: ${data.remainingPlayers.join(', ')}`);
        }
      });

      newSocket.on('all-hit', (data) => {
        setMessage(data.message);
        setGamePhase('Revealing');
      });

      newSocket.on('reveal-card', (data) => {
        setGamePhase('Revealing');
        setMessage(data.message);
        const allRevealed = [
          data.winningHitCardPlayer,
          ...data.otherTongPlayer,
        ];
        setHitCards(
          allRevealed.map((p) => ({
            player: p.name,
            cardHit: p.hitCard,
            cardUnder: p.revealedCard,
          }))
        );
      });

      newSocket.on('room-update', (data) => {
        if (data.message && data.message.includes('deleted')) {
          // Room was deleted
          setRooms((prev) =>
            prev.filter((room) => room.roomId !== data.roomId)
          );
        } else {
          // Room was created or updated
          setRooms((prev) => {
            const existing = prev.find((room) => room.roomId === data.roomId);
            if (existing) {
              // Update existing room
              return prev.map((room) =>
                room.roomId === data.roomId
                  ? { ...room, playerCount: data.playerCount }
                  : room
              );
            } else {
              // Add new room
              return [
                ...prev,
                {
                  roomId: data.roomId,
                  roomName: data.roomName,
                  playerCount: data.playerCount,
                },
              ];
            }
          });
        }
      });

      newSocket.on('active-rooms', (data) => {
        setRooms(data.rooms);
      });

      newSocket.on('game-result', (data) => {
        setGameResult(data.gameWinner);
        setGamePhase('Finished');
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

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (currentRoute === '/lobby' && socket) {
      setTimeout(() => {
        socket.emit('get-active-rooms');
      }, 100);
    }
  }, [currentRoute, socket]);

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
        body: mode === 'guest' ? undefined : JSON.stringify(body),
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

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    } else {
      setMessage('No connection to server');
    }
  };

  const selectCard = (card, index) => {
    if (selectedCardIndex === index) {
      setSelectedCard(null);
      setSelectedCardIndex(null);
    } else {
      setSelectedCard(card);
      setSelectedCardIndex(index);
    }
  };

  const playCard = () => {
    setMessage('');
    setMessage('')
    setTurnMessage('')
    if (socket && selectedCard) {
      socket.emit('play-card', selectedCard);
      setSelectedCard(null);
      setSelectedCardIndex(null);
    }
  };

  const foldCard = () => {
    setMessage('');
    setMessage('')
    setTurnMessage('')
    if (socket && selectedCard) {
      socket.emit('fold-card', selectedCard);
      setSelectedCard(null);
      setSelectedCardIndex(null);
    }
  };

  const hitCard = () => {
    setMessage('');
    setMessage('')
    setTurnMessage('')
    if (socket && selectedCard) {
      socket.emit('hit-card', selectedCard);
      setSelectedCard(null);
      setSelectedCardIndex(null);
    }
  };

  const throwCard = () => {
    setMessage('');
    setMessage('')
    setTurnMessage('')
    if (socket && selectedCard) {
      socket.emit('throw-card', selectedCard);
      setSelectedCard(null);
      setSelectedCardIndex(null);
    }
  };

  const showResult = () => {
    if (socket) {
      socket.emit('show-result');
    }
  };

  //convert guest account to player account
  const handleConvertToPlayer = async () => {
    if (!convertUsername.trim() || !convertPassword.trim()) {
      setMessage('Please enter both username and password');
      return;
    }

    setConvertLoading(true);
    try {
      const response = await fetch('http://localhost:5001/auth/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: convertUsername.trim(),
          password: convertPassword.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update player state with new info
        setPlayer(data.data.player);
        setToken(data.data.token);
        localStorage.setItem('token', data.data.token);
        setShowConvertModal(false);
        setConvertUsername('');
        setConvertPassword('');
        setMessage('Account upgraded successfully!');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Conversion failed');
    } finally {
      setConvertLoading(false);
    }
  };

  const fetchPlayerHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('http://localhost:5001/auth/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (response.ok) {
        setPlayerHistory(data.data);
      } else {
        console.error('History API Error:', data.message);
        setMessage(data.message || 'Failed to load history');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setMessage('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const restartGame = () => {
    setMessage('');
    setGameStarted(false);
    setGamePhase('Waiting');
    setMyCards([]);
    setPlayedCards([]);
    setHitCards([]);
    setRoundNumber(undefined);
    setSelectedCard(null);
    setSelectedCardIndex(null);
    setIsMyTurn(false);
    setTurnMessage('');
  };

  const handleLogout = () => {
    // Close socket first
    if (socket) {
      socket.close();
      setSocket(null);
    }

    // Clear all states
    setToken(null);
    setPlayer(null);
    setIsAuthenticated(false);
    setCurrentRoute('/auth');
    setUsername(null);
    setPassword(null);

    // Reset profile modal states
    setShowProfileModal(false);
    setProfileTab('profile');
    setPlayerHistory(null);

    // Reset other states
    setMessage('');
    setRooms([]); // Clear rooms list

    // Clear localStorage
    localStorage.removeItem('token');
  };

  const getCardImage = (card) => {
    if (!card || card === 'folded' || card === 'Unrevealed') return '/assets/BACK.png';
    return `/assets/${card.suit}_${card.value}.png`;
  };

  const renderAuthPage = () => (
    <div className="min-h-screen bg-green-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-800">
          Catte Card Game
        </h1>

        <div className="flex mb-4">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 px-4 rounded-l ${
              authMode === 'login' ? 'bg-green-600 text-white' : 'bg-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 px-4 rounded-r ${
              authMode === 'register'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200'
            }`}
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
              {loading
                ? 'Loading...'
                : authMode === 'login'
                ? 'Login'
                : 'Register'}
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
          <div
            className={`mt-4 p-3 rounded text-center ${
              message.includes('error') || message.includes('failed')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );

  const renderLobbyPage = () => (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with profile and logout */}
        <div className="bg-white rounded-lg p-4 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:bg-green-700 transition-colors"
              onClick={() => {
                setShowProfileModal(true)
                setProfileTab('profile');
                if (!playerHistory) {
                  fetchPlayerHistory();
                }
              }}
            >
              {player?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-800">
              {player?.username}
            </span>
          </div>

          {/* Make  when log out can log in again */}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              Game Lobby
            </h1>
            <p className="text-gray-600">Welcome, {player?.username}!</p>
          </div>
          <div
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
            onClick={() => setShowHelpModal(true)}
          >
            <span className="text-gray-600 font-bold text-lg">?</span>
          </div>
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
          <div
            className={`mt-4 p-4 rounded text-center ${
              message.includes('error')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message}
          </div>
        )}
        {/* Active Rooms List */}
        {rooms.length >= 0 && (
          <div className="mt-6 bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Available Rooms</h2>
              <button
                onClick={() => {
                  if (socket) {
                    socket.emit('get-active-rooms');
                  }
                }}
                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="space-y-2">
              {rooms.length === 0 && (
                <p className="text-gray-500">No active rooms available</p>
              )}
              {rooms.map((room) => {
                const isFull = room.playerCount >= 4;
                const isPlaying = room.isGamePlaying;
                const canJoin = !isFull && !isPlaying;
                
                let buttonText = 'Join';
                let buttonClass = 'bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700';
                
                if (isFull) {
                  buttonText = 'Full';
                  buttonClass = 'bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed';
                } else if (isPlaying) {
                  buttonText = 'Playing';
                  buttonClass = 'bg-yellow-500 text-white px-3 py-1 rounded text-sm cursor-not-allowed';
                }

                return (
                  <div
                    key={room.roomId}
                    className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <span className="font-medium">{room.roomName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {room.playerCount}/4 Players
                      </span>
                      {isPlaying && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          In Game
                        </span>
                      )}
                      <button
                        onClick={() => canJoin && socket.emit('join-room', room.roomId)}
                        disabled={!canJoin}
                        className={buttonClass}
                      >
                        {buttonText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl h-[80vh] overflow-y-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-green-800">
                How to Play Catte
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-lg">Game Overview</h3>
                <p>
                  Catte is a trick-taking card game where players compete to win
                  rounds and ultimately the game.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg">Setup</h3>
                <p>
                  Each player receives 6 cards. The game consists of 5 rounds of
                  trick-taking.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg">Playing Rounds 1-5</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Players take turns playing one card</li>
                  <li>Must follow suit if possible</li>
                  <li>Can fold if unable to beat the highest card</li>
                  <li>Highest card of the leading suit wins the trick</li>
                  <li>Winner of each round gets "Tong" status</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg">Final Reveal Phase</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Only players with Tong can participate</li>
                  <li>Players "hit" by playing one card face up</li>
                  <li>Can "throw" to beat the current highest hit card</li>
                  <li>After all players hit, cards are revealed</li>
                  <li>Player with highest remaining card wins!</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg">Card Values</h3>
                <p>
                  2 (lowest) → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → J → Q → K → A
                  (highest)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combined Profile & History Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl h-[80vh] overflow-y-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-green-800">
                Player Dashboard
              </h2>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileTab('profile');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setProfileTab('profile');
                  if (!playerHistory) {
                    fetchPlayerHistory();
                  }
                }}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                  profileTab === 'profile'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Profile Info
              </button>
              <button
                onClick={() => {
                  setProfileTab('history');
                  if (profileTab !== 'history') {
                    fetchPlayerHistory();
                  }
                }}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                  profileTab === 'history'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Game History
              </button>
            </div>

            {/* Tab Content */}
            {profileTab === 'profile' ? (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4">
                    {player?.username?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {player?.username}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {player?.isGuest ? 'Guest Player' : 'Registered Player'}
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <label className="font-semibold text-gray-700 text-lg">
                      Player ID:
                    </label>
                    <p className="text-gray-600 text-lg">{player?.id}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <label className="font-semibold text-gray-700 text-lg">Rank:</label>
                    <p className="text-gray-600 text-lg">{player?.rank || 0}</p>
                  </div>

                  {playerHistory && (
                    <>
                      <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <label className="font-semibold text-gray-700 text-lg">
                          Total Games:
                        </label>
                        <p className="text-gray-600 text-lg">{playerHistory.totalGames || 0}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <label className="font-semibold text-gray-700 text-lg">
                          Wins:
                        </label>
                        <p className="text-gray-600 text-lg">{playerHistory.wins || 0}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <label className="font-semibold text-gray-700 text-lg">
                          Losses:
                        </label>
                        <p className="text-gray-600 text-lg">{playerHistory.losses || 0}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <label className="font-semibold text-gray-700 text-lg">
                          Win Rate:
                        </label>
                        <p className="text-gray-600 text-lg">{playerHistory.winRate || '0%'}</p>
                      </div>
                    </>
                  )}
                  <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <label className="font-semibold text-gray-700 text-lg">
                      Account Type:
                    </label>
                    <p className="text-gray-600 text-lg">
                      {player?.isGuest ? 'Guest Account' : 'Registered Account'}
                    </p>
                  </div>
                </div>

                {player?.isGuest && (
                  <button
                    onClick={() => setShowConvertModal(true)}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg"
                  >
                    Upgrade to Full Account
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {loadingHistory ? (
                  <div className="text-center py-16">
                    <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                    <div className="text-xl text-gray-600">Loading history...</div>
                  </div>
                ) : playerHistory ? (
                  <div className="space-y-6">
                    {/* Recent Games Section */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <h3 className="font-bold text-xl mb-4 text-gray-800">
                        Recent Games
                      </h3>
                      {playerHistory.recentGames &&
                      playerHistory.recentGames.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {playerHistory.recentGames.map((game, index) => (
                            <div
                              key={index}
                              className={`bg-white p-4 rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md ${
                                game.result === 'win'
                                  ? 'border-green-400 hover:bg-green-50'
                                  : 'border-red-400 hover:bg-red-50'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full mr-3 ${
                                    game.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                                  }`}></div>
                                  <div>
                                    <span
                                      className={`font-bold text-lg ${
                                        game.result === 'win'
                                          ? 'text-green-600'
                                          : 'text-red-600'
                                      }`}
                                    >
                                      {game.result === 'win' ? 'Victory' : 'Defeat'}
                                    </span>
                                    <div className="text-sm text-gray-500">
                                      Game #{playerHistory.recentGames.length - index}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-600 font-medium">
                                    {game.date}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(game.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-gray-400 text-2xl font-bold">?</span>
                          </div>
                          <p className="text-gray-500 text-lg font-medium">No games played yet</p>
                          <p className="text-gray-400 text-sm mt-2">Start playing to see your game history!</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 text-3xl font-bold">!</span>
                    </div>
                    <p className="text-gray-500 text-xl font-medium">No history available</p>
                    <p className="text-gray-400 text-sm mt-2">Start playing to build your game history!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-800">
                Upgrade Account
              </h2>
              <button
                onClick={() => {
                  setShowConvertModal(false);
                  setConvertUsername('');
                  setConvertPassword('');
                  setMessage('');
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Convert your guest account to a full account to save your
                progress and access more features.
              </p>
              <input
                type="text"
                placeholder="Choose Username"
                value={convertUsername}
                onChange={(e) => setConvertUsername(e.target.value)}
                className="w-full p-3 border rounded"
              />
              <input
                type="password"
                placeholder="Choose Password"
                value={convertPassword}
                onChange={(e) => setConvertPassword(e.target.value)}
                className="w-full p-3 border rounded"
              />
              <button
                onClick={handleConvertToPlayer}
                disabled={convertLoading}
                className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {convertLoading ? 'Upgrading...' : 'Upgrade Account'}
              </button>
              {message && (
                <div
                  className={`p-3 rounded text-center ${
                    message.includes('error') || message.includes('failed')
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGamePage = () => (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Catte Card Game - {roomId}</h1>
              <button
                onClick={leaveRoom}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
              >
                Leave Room
              </button>
            </div>
            <div className="flex gap-4 justify-between items-center">
              {roundNumber == 0 && (
                <span className="text-sm">Round: {roundNumber}</span>
              )}
              <span className="text-sm">Phase: {gamePhase}</span>
              {!gameStarted && (
                <button
                  onClick={startGame}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Start Game
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Game Table */}
        <div className="bg-green-600 rounded-lg p-8 mb-4 relative h-[500px]">
          {/* Center area - played cards or hit cards */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Other Players - positioned around the center */}
            {players
              .filter((p) => p.name !== player?.username)
              .map((roomPlayer, index) => {
                const positions = [
                  'absolute top-8 left-1/2 transform -translate-x-1/2', // top
                  'absolute top-1/2 right-8 transform -translate-y-1/2', // right
                  'absolute top-1/2 left-8 transform -translate-y-1/2', // left
                ];

                const isPlayerTurn = turnMessage.includes(roomPlayer.name);

                return (
                  <div key={index} className={positions[index % 3]}>
                    <div className="text-white text-center font-bold">
                      {roomPlayer.name} {isPlayerTurn ? '(Turn)' : ''}
                    </div>
                    {/* Show back of cards for other players */}
                    <div className="flex gap-1 justify-center mt-1">
                      {[...Array(gameStarted ? 6 : 0)].map((_, cardIndex) => (
                        <img
                          key={cardIndex}
                          src="/assets/BACK.png"
                          alt="card back"
                          className="w-8 h-12 rounded shadow-lg"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

            <div className="bg-green-700 rounded-lg p-3 min-w-48 min-h-24 mb-20">
              {gamePhase === 'Playing' && playedCards.length > 0 && (
                <div className="text-white text-center mb-2">Played Cards</div>
              )}
              {gamePhase === 'Hitting' || gamePhase === 'Revealing' ? (
                <div className="text-white text-center mb-2">Hit Cards</div>
              ) : null}

              <div className="flex flex-wrap gap-2 justify-center">
                {gamePhase === 'Playing' && playedCards.map((play, index) => (
                  <div key={index} className="text-center">
                    <img
                      src={getCardImage(play.card)}
                      alt="card"
                      className="w-12 h-18 rounded shadow-lg"
                    />
                    <div className="text-white text-xs mt-1">{play.player.slice(0, 7)}</div>
                  </div>
                ))}
                
                {(gamePhase === 'Hitting' || gamePhase === 'Revealing') && hitCards.map((hit, index) => (
                  <div key={index} className="text-center">
                    <div className="flex gap-1">
                      <div>
                        <img
                          src={getCardImage(hit.cardHit)}
                          alt="hit card"
                          className="w-12 h-18 rounded shadow-lg"
                        />
                        <div className="text-white text-xs">Hit</div>
                      </div>
                      {gamePhase === 'Revealing' && (
                        <div>
                          <img
                            src={getCardImage(hit.cardUnder)}
                            alt="under card"
                            className="w-12 h-18 rounded shadow-lg"
                          />
                          <div className="text-white text-xs">Under</div>
                        </div>
                      )}
                    </div>
                    <div className="text-white text-xs mt-1">{hit.player.slice(0,7)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Player's Cards - Bottom of Table */}
          {gameStarted && myCards.length > 0 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
              {/* Action Buttons - shown when card is selected */}
              {selectedCard && (
              <div className="mb-6 flex justify-center gap-4">
                  {gamePhase === 'Playing' && isMyTurn && (
                    <>
                      <button
                        onClick={playCard}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 shadow-lg"
                      >
                        Play Card
                      </button>
                      <button
                        onClick={foldCard}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 shadow-lg"
                      >
                        Fold Card
                      </button>
                    </>
                  )}
                  {gamePhase === 'Hitting' && (
                    <>
                      <button
                        onClick={hitCard}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-lg"
                      >
                        Hit Card
                      </button>
                      <button
                        onClick={throwCard}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 shadow-lg"
                      >
                        Throw Card
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Player's Cards */}
              <div className="flex gap-4 justify-center mb-2">
                {myCards.map((card, index) => (
                  <div key={index} className="relative">
                    <img
                      src={getCardImage(card)}
                      alt={`${card.suit} ${card.value}`}
                      className={`w-16 h-22 rounded shadow-lg cursor-pointer hover:scale-105 hover:-translate-y-2 transition-all duration-200 ${
                        selectedCardIndex === index
                          ? 'ring-4 ring-gray-400 scale-105 -translate-y-1'
                          : ''
                      }`}
                      onClick={() => selectCard(card, index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player name when no cards (before game starts) */}
          {!gameStarted && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="text-white text-center font-bold">
                {player?.username}
              </div>
            </div>
          )}
        </div>

        {/* Notification */}
        {message && (
          <div className="fixed top-30 right-6 z-50 max-w-sm">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out animate-slide-in">
              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 text-center">{message.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMessage('')}
                  className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-lg">&times;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Turn Message */}
        {turnMessage && (
          <div className="mt-2 text-center text-white text-lg">
            {turnMessage}
          </div>
        )}

        {/* Show Result Button */}
        {gamePhase === 'Revealing' && (
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

        {/* Game Result Popup */}
        {gameResult && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 text-center max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-3xl font-bold text-green-800 mb-4">
                Game Over!
              </h2>
              <p className="text-2xl font-semibold mb-2">
                {gameResult.name === player?.username ? (
                  <span className="text-green-600">You've Won!</span>
                ) : (
                  <span className="text-red-600">You've Lost</span>
                )}
              </p>
              <p className="text-2xl font-semibold text-gray-600 mb-6">{gameResult.name} wins!</p>
              
              {gameResult.hitCard && (
                <div className="flex justify-center gap-4 mb-6">
                  <div className="text-center">
                    <img
                      src={getCardImage(gameResult.hitCard)}
                      alt="winning hit card"
                      className="w-20 h-28 rounded shadow-lg mx-auto"
                    />
                    <p className="text-sm mt-2 font-medium">Hit Card</p>
                  </div>
                  <div className="text-center">
                    <img
                      src={getCardImage(gameResult.revealedCard)}
                      alt="winning revealed card"
                      className="w-20 h-28 rounded shadow-lg mx-auto"
                    />
                    <p className="text-sm mt-2 font-medium">Under Card</p>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => {
                  setGameResult(null);
                  restartGame();
                  if (socket) {
                    socket.emit('restart-game-for-all');
                  }
                }}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
              >
                Play Again
              </button>
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
