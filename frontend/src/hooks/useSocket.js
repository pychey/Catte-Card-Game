import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { registerSocketListeners, unregisterSocketListeners, emitGetActiveRooms, emitGetOnlinePlayers, emitGetRoomInfo } from '../services/socketService';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const useSocket = ({ token, onAuthenticated, onConnectError, onRoomSuccess, onRoomError }) => {
  const [socket, setSocket] = useState(null);

  // Lobby state
  const [rooms, setRooms] = useState([]);
  const [onlinePlayers, setOnlinePlayers] = useState(undefined);

  // Room state
  const [roomId, setRoomId] = useState('');
  const [players, setPlayers] = useState([]);

  // Game state
  const [myCards, setMyCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [turnMessage, setTurnMessage] = useState('');
  const [roundNumber, setRoundNumber] = useState(undefined);
  const [playedCards, setPlayedCards] = useState([]);
  const [gamePhase, setGamePhase] = useState('Waiting');
  const [hitCards, setHitCards] = useState([]);
  const [gameResult, setGameResult] = useState(null);

  const restartGame = () => {
    setGameStarted(false);
    setGamePhase('Waiting');
    setMyCards([]);
    setPlayedCards([]);
    setHitCards([]);
    setRoundNumber(undefined);
    setIsMyTurn(false);
    setTurnMessage('');
  };

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SERVER_URL, { auth: { token } });

    registerSocketListeners(newSocket, {
      onAuthenticated: (data) => {
        onAuthenticated(data);
        setTimeout(() => {
          emitGetActiveRooms(newSocket);
          emitGetOnlinePlayers(newSocket);
        }, 100);
      },

      onConnectError: () => {
        onConnectError();
      },

      onRoomSuccess: (data) => {
        setRoomId(data.roomId);
        onRoomSuccess(data, newSocket);
        if (data.message.includes('Left room')) {
          restartGame();
          setPlayers([]);
          setRoomId(null);
          setTimeout(() => {
            emitGetActiveRooms(newSocket);
            emitGetOnlinePlayers(newSocket);
          }, 100);
        } else {
          emitGetRoomInfo(newSocket);
        }
      },

      onRoomError: (error) => {
        onRoomError(error);
      },

      onRoomPlayers: (data) => {
        setPlayers(data.players);
      },

      onRoomUpdate: (data) => {
        if (data.message && data.message.includes('deleted')) {
          setRooms((prev) => prev.filter((room) => room.roomId !== data.roomId));
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
              return [...prev, { roomId: data.roomId, roomName: data.roomName, playerCount: data.playerCount }];
            }
          });
        }
      },

      onOnlinePlayers: (data) => {
        setOnlinePlayers(data.onlinePlayersSize);
      },

      onPlayerJoined: (data) => {
        setPlayers((prev) => [...prev, data.player]);
      },

      onPlayerLeft: (data) => {
        setPlayers((prev) => prev.filter((p) => p.playerId !== data.playerId));
      },

      onGameStarted: (data) => {
        setGameResult(null);
        setGameStarted(true);
        setMyCards(data.yourCard);
        setGamePhase('Playing');
        setRoundNumber(1);
        emitGetActiveRooms(newSocket);
      },

      onGameReset: (data) => {
        restartGame();
      },

      onGameRestarted: () => {
        restartGame();
      },

      onGameResult: (data) => {
        setGameResult(data.gameWinner);
        setGamePhase('Finished');
      },

      onGameError: (error) => {
        onRoomError(error.message);
      },

      onYourTurn: (data) => {
        setIsMyTurn(true);
        setTurnMessage(data.message);
        if (data.message.includes('Hit')) setGamePhase('Hitting');
        if (data.yourCard) setMyCards(data.yourCard);
      },

      onNotYourTurn: (data) => {
        setIsMyTurn(false);
        setTurnMessage(data.message);
        if (data.message.includes('hit')) setGamePhase('Hitting');
        if (data.yourCard) setMyCards(data.yourCard);
      },

      onCardPlayed: (data) => {
        setPlayedCards((prev) => [...prev, { player: data.playerName, card: data.playerCard }]);
      },

      onCardFolded: (data) => {
        setPlayedCards((prev) => [...prev, { player: data.playerName, card: 'folded' }]);
      },

      onCardRemoved: (data) => {
        if (data.yourCard) setMyCards(data.yourCard);
      },

      onCardHit: (data) => {
        setHitCards((prev) => [...prev, { player: data.playerName, ...data.playerCard }]);
      },

      onCardError: (error) => {
        onRoomError(error.message);
      },

      onRoundWinner: () => {
        setRoundNumber((prev) => prev + 1);
      },

      onAllHit: () => {
        setGamePhase('Revealing');
      },

      onRevealCard: (data) => {
        setGamePhase('Revealing');
        const allRevealed = [data.winningHitCardPlayer, ...data.otherTongPlayer];
        setHitCards(
          allRevealed.map((p) => ({
            player: p.name,
            cardHit: p.hitCard,
            cardUnder: p.revealedCard,
          }))
        );
      },

      onActiveRooms: (data) => {
        setRooms(data.rooms);
      },
    });

    setSocket(newSocket);

    return () => {
      unregisterSocketListeners(newSocket);
      newSocket.close();
    };
  }, [token]);

  useEffect(() => {
    if (socket) {
      emitGetActiveRooms(socket);
    }
  }, [socket]);

  return {
    socket,
    // Lobby
    rooms,
    onlinePlayers,
    // Room
    roomId,
    players,
    // Game
    myCards,
    setMyCards,
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
  };
};

export default useSocket;