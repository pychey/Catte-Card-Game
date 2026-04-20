import { useState } from 'react';
import {
  emitStartGame,
  emitLeaveRoom,
  emitPlayCard,
  emitFoldCard,
  emitHitCard,
  emitShowResult,
  emitRestartGame,
} from '../../../services/socketService';

const useGameViewModel = ({ socket, setMessage, setTurnMessage, restartGame, setGameResult }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);

  const startGame = () => {
    if (socket) emitStartGame(socket);
  };

  const leaveRoom = () => {
    if (socket) {
      emitLeaveRoom(socket);
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

  const clearSelectedCard = () => {
    setSelectedCard(null);
    setSelectedCardIndex(null);
  };

  const playCard = () => {
    setMessage('');
    setTurnMessage('');
    if (socket && selectedCard) {
      emitPlayCard(socket, selectedCard);
      clearSelectedCard();
    }
  };

  const foldCard = () => {
    setMessage('');
    setTurnMessage('');
    if (socket && selectedCard) {
      emitFoldCard(socket, selectedCard);
      clearSelectedCard();
    }
  };

  const hitCard = () => {
    setMessage('');
    setTurnMessage('');
    if (socket && selectedCard) {
      emitHitCard(socket, selectedCard);
      clearSelectedCard();
    }
  };

  const showResult = () => {
    if (socket) emitShowResult(socket);
  };

  const playAgain = () => {
    setGameResult(null);
    restartGame();
    if (socket) emitRestartGame(socket);
  };

  const getCardImage = (card) => {
    if (!card || card === 'folded' || card === 'Unrevealed') return '/assets/BACK.png';
    return `/assets/${card.suit}_${card.value}.png`;
  };

  return {
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
  };
};

export default useGameViewModel;