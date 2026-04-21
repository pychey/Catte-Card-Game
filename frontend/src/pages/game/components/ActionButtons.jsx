const ActionButtons = ({ gamePhase, isMyTurn, playCard, foldCard, hitCard }) => {
  return (
    <div className="mb-6 flex justify-center gap-4">
      {gamePhase === 'Playing' && isMyTurn && (
        <>
          <button
            onClick={playCard}
            className="bg-yellow-500 text-white text-sm md:text-md px-3 md:px-4 py-2 rounded hover:bg-yellow-600 shadow-lg"
          >
            Play Card
          </button>
          <button
            onClick={foldCard}
            className="bg-red-600 text-white text-sm md:text-md px-3 md:px-4 py-2 rounded hover:bg-red-700 shadow-lg"
          >
            Fold Card
          </button>
        </>
      )}
      {gamePhase === 'Hitting' && (
        <button
          onClick={hitCard}
          className="bg-blue-600 text-white text-sm md:text-md px-3 md:px-4 py-2 rounded hover:bg-blue-700 shadow-lg"
        >
          Hit Card
        </button>
      )}
    </div>
  );
};

export default ActionButtons;