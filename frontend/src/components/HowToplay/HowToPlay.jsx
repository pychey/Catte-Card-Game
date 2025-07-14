import React from 'react';
import './HowToPlay.css';

const HowToPlay = () => {
  return (
    <div className="container">
      <div className="header">
        <h1>How to Play</h1>
      </div>
      <div className="content">
        <p>
          Welcome to the game! Here’s a quick guide on how to play: <br />
         
           
            Catte is a Vietnamese trick-taking card game for 2–6 players using a
            52-card deck. 
            Each player gets 6 cards, and the game has 7 rounds.
          
          <br />
          <b> Rounds 1–6:</b> <br />
          Players take turns playing one card. <br />
          You must follow the suit if possible; otherwise, skip. <br />
          The highest card of the correct suit wins the round. <br />
          If a player skips all 6 rounds, they are eliminated. <br />
          🔸 Round 7 (Final Round): <br />
          Only players who played in earlier rounds can join. <br />
          Each plays one final card. <br />
          The player with the highest card of the leading suit wins the game.{' '}
          <br />
          🏆 Win by: <br />
          Being the last remaining player, or <br />
          Winning the 7th round with the highest card. <br />
        </p>
      </div>
      <button type="submit" className="back-button">
        return
      </button>
    </div>
  );
};

export default HowToPlay;
