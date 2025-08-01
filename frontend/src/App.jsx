import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Auth from './pages/Auth';
import Lobby from './pages/Lobby';
import Game from './pages/Game';

const LAN_HOST = 'http://localhost:5001';

const App = () => {
  const [currentRoute, setCurrentRoute] = useState('/auth');
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [player, setPlayer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');

  const [rooms, setRooms] = useState([]);
  const [onlinePlayers, setOnlinePlayers] = useState(undefined);
  const [roomId, setRoomId] = useState('');

  const [players, setPlayers] = useState([]);
  const [myCards, setMyCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [turnMessage, setTurnMessage] = useState('');
  const [roundNumber, setRoundNumber] = useState(undefined);
  const [playedCards, setPlayedCards] = useState([]);
  const [gamePhase, setGamePhase] = useState('Waiting'); // Waiting, Playing, Hitting, Revealing, Finished
  const [hitCards, setHitCards] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);

  useEffect(() => {
    if (token && !socket) {
      const newSocket = io(LAN_HOST, {
        auth: { token },
      });

      newSocket.on('authenticated', (data) => {
        setIsAuthenticated(true);
        setPlayer(data.player);
        setCurrentRoute('/lobby');
        setTimeout(() => {
          newSocket.emit('get-active-rooms');
          newSocket.emit('get-online-players');
        }, 100);
      });

      newSocket.on('connect_error', () => {
        setMessage('Authentication failed');
        setToken(null);
        localStorage.removeItem('token');
      });

      newSocket.on('room-success', (data) => {
        setRoomId(data.roomId);
        setMessage(data.message);
        if (data.message.includes('Left room')) {
          setCurrentRoute('/lobby');
          restartGame();
          setPlayers([]);
          setRoomId(null);
          setTimeout(() => {
            newSocket.emit('get-active-rooms');
            newSocket.emit('get-online-players');
          }, 100);
        } else {
          setCurrentRoute('/room');
          newSocket.emit('get-room-info');
        }
      });

      newSocket.on('room-error', (error) => {
        setMessage(error);
      });

      newSocket.on('room-update', (data) => {
        console.log('Room update:', data);
      });

      newSocket.on('room-players', (data) => {
        setPlayers(data.players);
      });

      newSocket.on('online-players', (data) => {
        setOnlinePlayers(data.onlinePlayersSize);
      })

      newSocket.on('player-joined', (data) => {
        setPlayers((prev) => [...prev, data.player]);
      });

      newSocket.on('player-left', (data) => {
        setPlayers((prev) => prev.filter((p) => p.playerId !== data.playerId));
      });

      newSocket.on('game-reset', (data) => {
        restartGame();
        setMessage(data.message);
      });

      newSocket.on('game-started', (data) => {
        setGameResult(null);
        setGameStarted(true);
        setMyCards(data.yourCard);
        setGamePhase('Playing');
        setRoundNumber(1);
        newSocket.emit('get-active-rooms');
      });

      newSocket.on('game-restarted', () => {
        restartGame();
      });

      newSocket.on('your-turn', (data) => {
        console.log('your-turn', data);
        setIsMyTurn(true);
        setTurnMessage(data.message);
        if (data.message.includes('Hit')) setGamePhase('Hitting');
        if (data.yourCard) setMyCards(data.yourCard);
      });

      newSocket.on('not-your-turn', (data) => {
        console.log('not-your-turn', data);
        setIsMyTurn(false);
        setTurnMessage(data.message);
        if (data.message.includes('hit')) setGamePhase('Hitting');
        if (data.yourCard) setMyCards(data.yourCard);
      });

      newSocket.on('card-played', (data) => {
        setPlayedCards((prev) => [
          ...prev,
          { player: data.playerName, card: data.playerCard },
        ]);
      });

      newSocket.on('card-folded', (data) => {
        setPlayedCards((prev) => [
          ...prev,
          { player: data.playerName, card: 'folded' },
        ]);
      });

      newSocket.on('card-removed', (data) => {
        if (data.yourCard) setMyCards(data.yourCard);
      });

      newSocket.on('round-winner', (data) => {
        setRoundNumber((prev) => prev + 1);
      });

      newSocket.on('card-hit', (data) => {
        setHitCards((prev) => [
          ...prev,
          { player: data.playerName, ...data.playerCard },
        ]);
        if (data.remainingPlayers) {
          setMessage(`Waiting for: ${data.remainingPlayers.join(', ')}`);
        }
      });

      newSocket.on('all-hit', (data) => {
        setMessage(data.message);
        setGamePhase('Revealing');
      });

      newSocket.on('reveal-card', (data) => {
        setGamePhase('Revealing');
        setMessage(data.message);
        const allRevealed = [
          data.winningHitCardPlayer,
          ...data.otherTongPlayer,
        ];
        setHitCards(
          allRevealed.map((p) => ({
            player: p.name,
            cardHit: p.hitCard,
            cardUnder: p.revealedCard,
          }))
        );
      });

      newSocket.on('room-update', (data) => {
        if (data.message && data.message.includes('deleted')) {
          setRooms((prev) =>
            prev.filter((room) => room.roomId !== data.roomId)
          );
        } else {
          setRooms((prev) => {
            const existing = prev.find((room) => room.roomId === data.roomId);
            if (existing) {
              return prev.map((room) =>
                room.roomId === data.roomId
                  ? { ...room, playerCount: data.playerCount }
                  : room
              );
            } else {
              return [
                ...prev,
                {
                  roomId: data.roomId,
                  roomName: data.roomName,
                  playerCount: data.playerCount,
                },
              ];
            }
          });
        }
      });

      newSocket.on('active-rooms', (data) => {
        setRooms(data.rooms);
      });

      newSocket.on('game-result', (data) => {
        setGameResult(data.gameWinner);
        setGamePhase('Finished');
        setMessage(`${data.gameWinner.name} wins the game!`);
      });

      newSocket.on('game-error', (error) => {
        setMessage(error.message);
      });

      newSocket.on('card-error', (error) => {
        setMessage(error.message);
      });

      setSocket(newSocket);
      
      return () => {
        if (newSocket) {
          newSocket.removeAllListeners();
          newSocket.close();
        }
      };
    }
  }, [token]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (currentRoute === '/lobby' && socket) {
      setTimeout(() => {
        socket.emit('get-active-rooms');
      }, 100);
    }
  }, [currentRoute, socket]);

  const handleLogout = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }

    setToken(null);
    setPlayer(null);
    setIsAuthenticated(false);
    setCurrentRoute('/auth');
    setMessage('');
    setRooms([]);

    localStorage.removeItem('token');
  };

  const restartGame = () => {
    setMessage('');
    setGameStarted(false);
    setGamePhase('Waiting');
    setMyCards([]);
    setPlayedCards([]);
    setHitCards([]);
    setRoundNumber(undefined);
    setSelectedCard(null);
    setSelectedCardIndex(null);
    setIsMyTurn(false);
    setTurnMessage('');
  };

  if (currentRoute === '/auth') {
    return (
      <Auth 
        setToken={setToken}
        setPlayer={setPlayer}
        message={message}
        setMessage={setMessage}
        LAN_HOST={LAN_HOST}
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
        LAN_HOST={LAN_HOST}
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
        selectedCard={selectedCard}
        selectedCardIndex={selectedCardIndex}
        setSelectedCard={setSelectedCard}
        setSelectedCardIndex={setSelectedCardIndex}
        gameResult={gameResult}
        setGameResult={setGameResult}
        message={message}
        setMessage={setMessage}
        restartGame={restartGame}
      />
    );
  }

  return <div>Loading...</div>;
};

export default App;