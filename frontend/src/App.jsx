import { useState, useEffect } from 'react';
import useSocket from './hooks/useSocket';
import Auth from './pages/auth/Auth';
import Lobby from './pages/lobby/Lobby';
import Game from './pages/game/Game';

const App = () => {
  const [currentRoute, setCurrentRoute] = useState('/auth');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [player, setPlayer] = useState(null);
  const [message, setMessage] = useState('');

  const {
    socket,
    rooms,
    onlinePlayers,
    roomId,
    players,
    myCards,
    gameStarted,
    isMyTurn,
    turnMessage,
    setTurnMessage,
    roundNumber,
    playedCards,
    gamePhase,
    hitCards,
    gameResult,
    setGameResult,
    restartGame,
  } = useSocket({
    token,
    onAuthenticated: (data) => {
      setPlayer(data.player);
      setCurrentRoute('/lobby');
    },
    onConnectError: () => {
      setMessage('Authentication failed');
      setToken(null);
      localStorage.removeItem('token');
    },
    onRoomSuccess: (data) => {
      setMessage(data.message);
      if (data.message.includes('Left room')) {
        setCurrentRoute('/lobby');
      } else {
        setCurrentRoute('/room');
      }
    },
    onRoomError: (error) => {
      setMessage(error);
    },
  });

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleLogout = () => {
    if (socket) socket.close();
    setToken(null);
    setPlayer(null);
    setCurrentRoute('/auth');
    setMessage('');
    localStorage.removeItem('token');
  };

  if (currentRoute === '/auth') {
    return (
      <Auth
        setToken={setToken}
        setPlayer={setPlayer}
        message={message}
        setMessage={setMessage}
      />
    );
  } else if (currentRoute === '/lobby') {
    return (
      <Lobby
        player={player}
        socket={socket}
        rooms={rooms}
        onlinePlayers={onlinePlayers}
        message={message}
        setMessage={setMessage}
        handleLogout={handleLogout}
        token={token}
        setToken={setToken}
        setPlayer={setPlayer}
      />
    );
  } else if (currentRoute === '/room') {
    return (
      <Game
        player={player}
        socket={socket}
        roomId={roomId}
        players={players}
        myCards={myCards}
        gameStarted={gameStarted}
        gamePhase={gamePhase}
        playedCards={playedCards}
        hitCards={hitCards}
        isMyTurn={isMyTurn}
        turnMessage={turnMessage}
        roundNumber={roundNumber}
        gameResult={gameResult}
        setGameResult={setGameResult}
        message={message}
        setMessage={setMessage}
        restartGame={restartGame}
        setTurnMessage={setTurnMessage}
      />
    );
  }

  return <div>Loading...</div>;
};

export default App;