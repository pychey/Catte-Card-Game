import PlayerHand from './PlayerHand';

const GameTable = ({
  player, players, gameStarted, gamePhase, turnMessage,
  playedCards, hitCards, myCards, isMyTurn, selectedCardIndex,
  selectCard, playCard, foldCard, hitCard, getCardImage,
}) => {
  return (
    <div className="bg-green-600 rounded-lg p-8 mb-4 relative h-[500px]">
      <div className="absolute inset-0 flex items-center justify-center">

        {/* Other Players */}
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

        {/* Center Table */}
        <div className="bg-green-700 rounded-lg p-3 min-w-48 min-h-24 mb-20">
          {gamePhase === 'Playing' && playedCards.length > 0 && (
            <div className="text-white text-center mb-2">Played Cards</div>
          )}
          {(gamePhase === 'Hitting' || gamePhase === 'Revealing') && (
            <div className="text-white text-center mb-2">Hit Cards</div>
          )}
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
                <div className="text-white text-xs mt-1">{hit.player.slice(0, 7)}</div>
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
          <div className="text-white text-center font-bold">{player?.username}</div>
        </div>
      )}
    </div>
  );
};

export default GameTable;