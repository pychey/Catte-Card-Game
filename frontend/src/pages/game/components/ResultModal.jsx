const ResultModal = ({ gameResult, player, getCardImage, playAgain }) => {
  if (!gameResult) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 text-center max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-3xl font-bold text-green-800 mb-4">Game Finished!</h2>
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
          onClick={playAgain}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default ResultModal;