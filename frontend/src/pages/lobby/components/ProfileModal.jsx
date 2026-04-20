const ProfileModal = ({
  player,
  profileTab,
  setProfileTab,
  playerHistory,
  loadingHistory,
  handleFetchHistory,
  onClose,
  onOpenConvert,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl h-[80vh] overflow-y-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-green-800">Player Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              setProfileTab('profile');
              if (!playerHistory) handleFetchHistory();
            }}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              profileTab === 'profile' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => {
              setProfileTab('history');
              handleFetchHistory();
            }}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              profileTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Game History
          </button>
        </div>

        {/* Profile Tab */}
        {profileTab === 'profile' ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4">
                {player?.username?.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{player?.username}</h3>
              <p className="text-gray-600 text-lg">{player?.isGuest ? 'Guest Player' : 'Registered Player'}</p>
            </div>
            <div className="grid gap-4">
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <label className="font-semibold text-gray-700 text-lg">Player ID:</label>
                <p className="text-gray-600 text-lg">{player?.id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <label className="font-semibold text-gray-700 text-lg">Rank:</label>
                <p className="text-gray-600 text-lg">{player?.rank || 0}</p>
              </div>
              {playerHistory && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <label className="font-semibold text-gray-700 text-lg">Total Games:</label>
                    <p className="text-gray-600 text-lg">{playerHistory.totalGames || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <label className="font-semibold text-gray-700 text-lg">Wins:</label>
                    <p className="text-gray-600 text-lg">{playerHistory.wins || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <label className="font-semibold text-gray-700 text-lg">Losses:</label>
                    <p className="text-gray-600 text-lg">{playerHistory.losses || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <label className="font-semibold text-gray-700 text-lg">Win Rate:</label>
                    <p className="text-gray-600 text-lg">{playerHistory.winRate || '0%'}</p>
                  </div>
                </>
              )}
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <label className="font-semibold text-gray-700 text-lg">Account Type:</label>
                <p className="text-gray-600 text-lg">{player?.isGuest ? 'Guest Account' : 'Registered Account'}</p>
              </div>
            </div>
            {player?.isGuest && (
              <button
                onClick={onOpenConvert}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg"
              >
                Convert to Account
              </button>
            )}
          </div>
        ) : (
          // History Tab
          <div className="space-y-6">
            {loadingHistory ? (
              <div className="text-center py-16">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                <div className="text-xl text-gray-600">Loading history...</div>
              </div>
            ) : playerHistory ? (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-xl mb-4 text-gray-800">Recent Games</h3>
                {playerHistory.recentGames && playerHistory.recentGames.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {playerHistory.recentGames.map((game, index) => (
                      <div
                        key={index}
                        className={`bg-white p-4 rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md ${
                          game.result === 'win' ? 'border-green-400 hover:bg-green-50' : 'border-red-400 hover:bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${game.result === 'win' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                              <span className={`font-bold text-lg ${game.result === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                                {game.result === 'win' ? 'Victory' : 'Defeat'}
                              </span>
                              <div className="text-sm text-gray-500">Game #{playerHistory.recentGames.length - index}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 font-medium">{game.date}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg font-medium">No games played yet</p>
                    <p className="text-gray-400 text-sm mt-2">Start playing to see your game history!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-xl font-medium">No history available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;