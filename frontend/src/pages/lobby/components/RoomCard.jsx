const RoomCard = ({ room, onJoin }) => {
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
    <div className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
      <div>
        <span className="font-medium">{room.roomName}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{room.playerCount}/4 Players</span>
        {isPlaying && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            In Game
          </span>
        )}
        <button
          onClick={() => canJoin && onJoin(room.roomId)}
          disabled={!canJoin}
          className={buttonClass}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default RoomCard;