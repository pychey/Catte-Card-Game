import ActionButtons from './ActionButtons';

const PlayerHand = ({ myCards, gamePhase, isMyTurn, selectedCardIndex, selectCard, playCard, foldCard, hitCard, getCardImage }) => {
  if (!myCards.length) return null;

  return (
    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-full">
      {selectedCardIndex !== null && (
        <ActionButtons
          gamePhase={gamePhase}
          isMyTurn={isMyTurn}
          playCard={playCard}
          foldCard={foldCard}
          hitCard={hitCard}
        />
      )}
      <div className="flex gap-2 sm:gap-4 justify-center mb-2">
        {myCards.map((card, index) => (
          <div key={index} className="relative">
            <img
              src={getCardImage(card)}
              alt={`${card.suit} ${card.value}`}
              className={`w-12 h-18 sm:w-14 sm:h-20 md:w-16 md:h-22 rounded shadow-lg cursor-pointer hover:scale-105 hover:-translate-y-2 transition-all duration-200 ${
                selectedCardIndex === index
                  ? 'ring-2 ring-gray-400 scale-105 -translate-y-1'
                  : ''
              }`}
              onClick={() => selectCard(card, index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;