export const emitGetActiveRooms = (socket) => socket.emit('get-active-rooms');
export const emitGetOnlinePlayers = (socket) => socket.emit('get-online-players');
export const emitGetRoomInfo = (socket) => socket.emit('get-room-info');
export const emitCreateRoom = (socket, roomName) => socket.emit('create-room', roomName);
export const emitJoinRoom = (socket, roomId) => socket.emit('join-room', roomId);
export const emitLeaveRoom = (socket) => socket.emit('leave-room');
export const emitStartGame = (socket) => socket.emit('start-game');
export const emitPlayCard = (socket, card) => socket.emit('play-card', card);
export const emitFoldCard = (socket, card) => socket.emit('fold-card', card);
export const emitHitCard = (socket, card) => socket.emit('hit-card', card);
export const emitShowResult = (socket) => socket.emit('show-result');
export const emitRestartGame = (socket) => socket.emit('restart-game-for-all');

export const registerSocketListeners = (socket, handlers) => {
  socket.on('authenticated', handlers.onAuthenticated);
  socket.on('connect_error', handlers.onConnectError);
  socket.on('room-success', handlers.onRoomSuccess);
  socket.on('room-error', handlers.onRoomError);
  socket.on('room-players', handlers.onRoomPlayers);
  socket.on('room-update', handlers.onRoomUpdate);
  socket.on('online-players', handlers.onOnlinePlayers);
  socket.on('player-joined', handlers.onPlayerJoined);
  socket.on('player-left', handlers.onPlayerLeft);
  socket.on('game-started', handlers.onGameStarted);
  socket.on('game-reset', handlers.onGameReset);
  socket.on('game-restarted', handlers.onGameRestarted);
  socket.on('game-result', handlers.onGameResult);
  socket.on('game-error', handlers.onGameError);
  socket.on('your-turn', handlers.onYourTurn);
  socket.on('not-your-turn', handlers.onNotYourTurn);
  socket.on('card-played', handlers.onCardPlayed);
  socket.on('card-folded', handlers.onCardFolded);
  socket.on('card-removed', handlers.onCardRemoved);
  socket.on('card-hit', handlers.onCardHit);
  socket.on('card-error', handlers.onCardError);
  socket.on('round-winner', handlers.onRoundWinner);
  socket.on('all-hit', handlers.onAllHit);
  socket.on('reveal-card', handlers.onRevealCard);
  socket.on('active-rooms', handlers.onActiveRooms);
};

export const unregisterSocketListeners = (socket) => {
  socket.removeAllListeners();
};