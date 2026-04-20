import useLobbyViewModel from './viewmodel/useLobbyViewModel';
import HelpModal from './components/HelpModal';
import ConvertModal from './components/ConvertModal';
import RoomList from './components/RoomList';
import ProfileModal from './components/ProfileModal';
import RoomActionCard from './components/RoomActionCard';

const Lobby = ({ player, socket, rooms, onlinePlayers, message, setMessage, handleLogout, token, setToken, setPlayer }) => {
  const {
    roomName,
    setRoomName,
    roomId,
    setRoomId,
    createRoom,
    joinRoom,
    refreshRooms,
    showHelpModal,
    setShowHelpModal,
    showProfileModal,
    openProfileModal,
    closeProfileModal,
    profileTab,
    setProfileTab,
    showConvertModal,
    setShowConvertModal,
    playerHistory,
    loadingHistory,
    handleFetchHistory,
    convertUsername,
    setConvertUsername,
    convertPassword,
    setConvertPassword,
    convertLoading,
    handleConvertAccount,
  } = useLobbyViewModel({ socket, token, setToken, setPlayer, setMessage });

  return (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg p-4 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:bg-green-700 transition-colors"
              onClick={openProfileModal}
            >
              {player?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-800">{player?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Welcome */}
        <div className="bg-white rounded-lg py-4 px-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">Game Lobby</h1>
            <p className="text-gray-600">Welcome, {player?.username}!</p>
          </div>
          <div
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
            onClick={() => setShowHelpModal(true)}
          >
            <span className="text-gray-600 font-bold text-lg">?</span>
          </div>
        </div>

        {/* Create & Join */}
        <div className="grid sm:grid-cols-2 gap-6">
          <RoomActionCard 
            title={'Create Room'}
            placeholder={'Room Name'}
            value={roomName}
            onChange={setRoomName}
            onClick={createRoom}
            buttonMessage={'Create Room'}
            buttonColor='green'
          />
          
          <RoomActionCard 
            title="Join Room"
            placeholder="Room ID"
            value={roomId}
            onChange={setRoomId}
            transform={(val) => val.toUpperCase()}
            onClick={() => joinRoom(roomId)}
            buttonMessage="Join Room"
            buttonColor='blue'
          />
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded text-center ${
            message.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Room List */}
        <RoomList
          rooms={rooms}
          onlinePlayers={onlinePlayers}
          onJoin={joinRoom}
          onRefresh={refreshRooms}
        />

      </div>

      {/* Modals */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}

      {showProfileModal && (
        <ProfileModal
          player={player}
          profileTab={profileTab}
          setProfileTab={setProfileTab}
          playerHistory={playerHistory}
          loadingHistory={loadingHistory}
          handleFetchHistory={handleFetchHistory}
          onClose={closeProfileModal}
          onOpenConvert={() => setShowConvertModal(true)}
        />
      )}

      {showConvertModal && (
        <ConvertModal
          convertUsername={convertUsername}
          setConvertUsername={setConvertUsername}
          convertPassword={convertPassword}
          setConvertPassword={setConvertPassword}
          convertLoading={convertLoading}
          handleConvertAccount={handleConvertAccount}
          onClose={() => {
            setShowConvertModal(false);
            setConvertUsername('');
            setConvertPassword('');
          }}
          message={message}
        />
      )}

    </div>
  );
};

export default Lobby;