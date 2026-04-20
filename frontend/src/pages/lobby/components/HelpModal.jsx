const HelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl h-[80vh] overflow-y-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-800">How to Play Catte</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
        </div>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-bold text-lg">Game Overview</h3>
            <p>Catte is a trick-taking card game where players compete to win rounds and ultimately the game.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg">Setup</h3>
            <p>Each player receives 6 cards. The game consists of 5 rounds of trick-taking.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg">Playing Rounds 1-5</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Players take turns playing one card</li>
              <li>Must follow suit of the first players</li>
              <li>Can fold if unable to beat</li>
              <li>Highest card of the leading suit wins the trick</li>
              <li>Winner of each round gets "Tong" status</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg">Final Reveal Phase</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Only players with Tong can participate</li>
              <li>Players "hit" by playing one card face up</li>
              <li>Can "hit" to beat the current highest hit card</li>
              <li>After all players hit, back card is revealed</li>
              <li>Back card of the hit card winner take the lead</li>
              <li>Highest card of the leading suit wins</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg">Card Values</h3>
            <p>2 (lowest) → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → J → Q → K → A (highest)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;