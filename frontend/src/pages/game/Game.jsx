import useGameViewModel from './viewmodel/useGameViewModel';
import GameTable from './components/GameTable';
import Notification from './components/Notification';
import ResultModal from './components/ResultModal';

const Game = ({
  player, socket, roomId, players, myCards, gameStarted, gamePhase,
  playedCards, hitCards, isMyTurn, turnMessage, roundNumber,
  gameResult, setGameResult, message, setMessage, restartGame, setTurnMessage,
}) => {
  const {
    selectedCard,
    selectedCardIndex,
    startGame,
    leaveRoom,
    selectCard,
    playCard,
    foldCard,
    hitCard,
    showResult,
    playAgain,
    getCardImage,
  } = useGameViewModel({ socket, setMessage, setTurnMessage, restartGame, setGameResult });

  return (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold">Catte <span className='inline sm:hidden md:inline'>Card Game</span> - {roomId}</h1>
              <button
                onClick={leaveRoom}
                className="hidden md:block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
              >
                Leave Room
              </button>
            </div>
            <div className="flex gap-4 justify-between items-center">
              {roundNumber > 0 && (
                <span className="text-sm">Round: {roundNumber}</span>
              )}
              <span className="text-sm">Phase: {gamePhase}</span>
              {!gameStarted && (
                <button
                  onClick={startGame}
                  className="hidden md:block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                >
                  Start Game
                </button>
              )}
            </div>
            <div className="flex md:hidden items-center gap-4">
              <button
                onClick={leaveRoom}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
              >
                Leave Room
              </button>
              {!gameStarted && (
                <button
                  onClick={startGame}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                >
                  Start Game
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Game Table */}
        <GameTable
          player={player}
          players={players}
          gameStarted={gameStarted}
          gamePhase={gamePhase}
          turnMessage={turnMessage}
          playedCards={playedCards}
          hitCards={hitCards}
          myCards={myCards}
          isMyTurn={isMyTurn}
          selectedCardIndex={selectedCardIndex}
          selectCard={selectCard}
          playCard={playCard}
          foldCard={foldCard}
          hitCard={hitCard}
          getCardImage={getCardImage}
        />

        {/* Notification */}
        <Notification message={message} setMessage={setMessage} />

        {/* Turn Message */}
        {turnMessage && (
          <div className="mt-2 text-center text-white text-md md:text-lg">{turnMessage}</div>
        )}

        {/* Show Result Button */}
        {gamePhase === 'Revealing' && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={showResult}
              className="bg-yellow-600 text-white text-sm md:text-md px-3 md:px-6 py-2 md:py-3 rounded hover:bg-yellow-700"
            >
              Show Result
            </button>
          </div>
        )}

        {/* Result Modal */}
        <ResultModal
          gameResult={gameResult}
          player={player}
          getCardImage={getCardImage}
          playAgain={playAgain}
        />

      </div>
    </div>
  );
};

export default Game;