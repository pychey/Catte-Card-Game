const Game = ({ 
    player, socket, roomId, players, myCards, gameStarted, gamePhase, playedCards, hitCards, isMyTurn, turnMessage, roundNumber, selectedCard,
    selectedCardIndex, setSelectedCard, setSelectedCardIndex, gameResult, setGameResult, message, setMessage, restartGame, setTurnMessage
}) => {

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
    setTurnMessage('');
    if (socket && selectedCard) {
      socket.emit('play-card', selectedCard);
      setSelectedCard(null);
      setSelectedCardIndex(null);
    }
  };

  const foldCard = () => {
    setMessage('');
    setTurnMessage('');
    if (socket && selectedCard) {
      socket.emit('fold-card', selectedCard);
      setSelectedCard(null);
      setSelectedCardIndex(null);
    }
  };

  const hitCard = () => {
    setMessage('');
    setTurnMessage('');
    if (socket && selectedCard) {
      socket.emit('hit-card', selectedCard);
      setSelectedCard(null);
      setSelectedCardIndex(null);
    }
  };

  const showResult = () => {
    if (socket) {
      socket.emit('show-result');
    }
  };

  const getCardImage = (card) => {
    if (!card || card === 'folded' || card === 'Unrevealed') return '/assets/BACK.png';
    return `/assets/${card.suit}_${card.value}.png`;
  };

  return (
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
              {roundNumber > 0 && (
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
          <div className="absolute inset-0 flex items-center justify-center">
            {players
              .filter((p) => p.name !== player?.username)
              .map((roomPlayer, index) => {
                const positions = [
                  'absolute top-8 left-1/2 transform -translate-x-1/2',
                  'absolute top-1/2 right-8 transform -translate-y-1/2',
                  'absolute top-1/2 left-8 transform -translate-y-1/2',
                ];

                const isPlayerTurn = turnMessage.includes(roomPlayer.name);

                return (
                  <div key={index} className={positions[index % 3]}>
                    <div className="text-white text-center font-bold">
                      {roomPlayer.name} {isPlayerTurn ? '(Turn)' : ''}
                    </div>
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

          {/* Player Name */}
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

        {/* Game Result Popup */}
        {gameResult && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 text-center max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-3xl font-bold text-green-800 mb-4">
                Game Finished!
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
};

export default Game;