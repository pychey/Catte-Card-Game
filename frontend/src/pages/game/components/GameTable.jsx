import PlayerHand from './PlayerHand';

const GameTable = ({
  player, players, gameStarted, gamePhase, turnMessage,
  playedCards, hitCards, myCards, isMyTurn, selectedCardIndex,
  selectCard, playCard, foldCard, hitCard, getCardImage,
}) => {
  return (
    <div className="bg-green-600 rounded-lg p-8 mb-4 relative h-[500px] md:h-[550px]">
      <div className="absolute inset-0 flex items-center justify-center">

        {/* Other Players */}
        {players
          .filter((p) => p.name !== player?.username)
          .map((roomPlayer, index) => {
            const positions = [
              'flex flex-col gap-1 absolute top-8 left-1/2 transform -translate-x-1/2',
              'flex flex-col gap-1 absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 [writing-mode:vertical-rl] [text-orientation:upright] sm:[writing-mode:horizontal-tb] sm:[text-orientation:mixed]',
              'flex flex-col gap-1 absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 [writing-mode:vertical-lr] [text-orientation:upright] sm:[writing-mode:horizontal-tb] sm:[text-orientation:mixed]',
            ];
            const isPlayerTurn = turnMessage.includes(roomPlayer.name);
            return (
              <div key={index} className={positions[index % 3]}>
                <div className="text-white text-center font-bold text-sm sm:text-md">
                  {roomPlayer.name}
                </div>
                <div className="flex gap-1">
                  {[...Array(gameStarted ? 6 : 0)].map((_, cardIndex) => (
                    <img
                      key={cardIndex}
                      src="/assets/BACK.png"
                      alt="card back"
                      className="w-6 h-9 md:w-8 md:h-12 rounded shadow-lg"
                    />
                  ))}
                </div>
              </div>
            );
          })}

        {/* Center Table */}
        <div className="bg-green-700 rounded-lg p-3 min-w-48 min-h-24">
          {gamePhase === 'Playing' && playedCards.length > 0 && (
            <div className="text-white text-center mb-2 text-sm sm:text-md">Played Cards</div>
          )}
          {(gamePhase === 'Hitting' || gamePhase === 'Revealing') && (
            <div className="text-white text-center mb-2 text-sm sm:text-md">Hit Cards</div>
          )}
          <div className="flex flex-wrap gap-2 justify-center">
            {gamePhase === 'Playing' && playedCards.map((play, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <img
                  src={getCardImage(play.card)}
                  alt="card"
                  className="w-10 h-15 md:w-12 md:h-18 rounded shadow-lg"
                />
                <div className="text-white text-xs mt-1">{play.player.slice(0, 4)}</div>
              </div>
            ))}
            {(gamePhase === 'Hitting' || gamePhase === 'Revealing') && hitCards.map((hit, index) => (
              <div key={index} className="text-center">
                <div className="flex gap-1">
                  <div>
                    <img
                      src={getCardImage(hit.cardHit)}
                      alt="hit card"
                      className="w-10 h-15 md:w-12 md:h-18 rounded shadow-lg"
                    />
                  </div>
                  {gamePhase === 'Revealing' && (
                    <div>
                      <img
                        src={getCardImage(hit.cardUnder)}
                        alt="under card"
                        className="w-10 h-15 md:w-12 md:h-18 rounded shadow-lg"
                      />
                    </div>
                  )}
                </div>
                <div className="text-white text-xs mt-1">{hit.player.slice(0, 4)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Hand */}
      {gameStarted && (
        <PlayerHand
          myCards={myCards}
          gamePhase={gamePhase}
          isMyTurn={isMyTurn}
          selectedCardIndex={selectedCardIndex}
          selectCard={selectCard}
          playCard={playCard}
          foldCard={foldCard}
          hitCard={hitCard}
          getCardImage={getCardImage}
        />
      )}

      {/* Player Name pre-game */}
      {!gameStarted && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="text-white text-center font-bold text-sm sm:text-md">{player?.username}</div>
        </div>
      )}
    </div>
  );
};

export default GameTable;