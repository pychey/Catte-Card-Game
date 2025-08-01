import { useState } from 'react';

const Lobby = ({ player, socket, rooms, onlinePlayers, message, setMessage, handleLogout, token, setToken, setPlayer, LAN_HOST }) => {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState('profile');
  const [playerHistory, setPlayerHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertUsername, setConvertUsername] = useState('');
  const [convertPassword, setConvertPassword] = useState('');
  const [convertLoading, setConvertLoading] = useState(false);

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

  const fetchPlayerHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${LAN_HOST}/auth/history`, {
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

  const handleConvertToPlayer = async () => {
    if (!convertUsername.trim() || !convertPassword.trim()) {
      setMessage('Please enter both username and password');
      return;
    }

    setConvertLoading(true);
    try {
      const response = await fetch(`${LAN_HOST}/auth/convert`, {
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

  return (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Profile */}
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
              <h2 className="text-xl font-bold">Available Rooms - Online : {onlinePlayers}</h2>
              <button
                onClick={() => {
                  if (socket) {
                    socket.emit('get-active-rooms');
                    socket.emit('get-online-players');
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
                  <li>Must follow suit of the first players</li>
                  <li>Can fold if unable to beat</li>
                  <li>Highest card of the leading suit wins the trick</li>
                  <li>Winner of each round gets "Tong" status</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg">Final Reveal Phase</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Only players with Tong can participate</li>
                  <li>Players "hit" by playing one card face up</li>
                  <li>Can "hit" to beat the current highest hit card</li>
                  <li>After all players hit, back card is revealed</li>
                  <li>Back card of the hit card winner take the lead</li>
                  <li>Highest card of the leading suit wins</li>
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
                    Convert to Account
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
};

export default Lobby;