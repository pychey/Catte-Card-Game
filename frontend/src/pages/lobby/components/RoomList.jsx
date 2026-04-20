import RoomCard from './RoomCard';

const RoomList = ({ rooms, onlinePlayers, onJoin, onRefresh }) => {
  return (
    <div className="mt-6 bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold">Available Rooms - Online: {onlinePlayers}</h2>
        <button
          onClick={onRefresh}
          className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">
            Refresh
          </span>
        </button>
      </div>
      <div className="space-y-2">
        {rooms.length === 0 && (
          <p className="text-gray-500">No active rooms available</p>
        )}
        {rooms.map((room) => (
          <RoomCard key={room.roomId} room={room} onJoin={onJoin} />
        ))}
      </div>
    </div>
  );
};

export default RoomList;