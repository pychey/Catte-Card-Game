import * as gameServices from '../services/game.socket.service.js';

export const startGame = (socket, io, rooms) => {
    if(!socket.data.roomId) return socket.emit('game-error', { message: 'You are not in a room'});
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);
    if (room.players.length < 2) return socket.emit('game-error', { message: 'Not enough players in room'});

    if (!room.deck) room.deck = gameServices.buildDeck();
    gameServices.shuffleDeck(room.deck);
    gameServices.startGame(room);

    room.players.forEach(player => io.to(player.socketId).emit('game-started', { yourCard: player.cards }));

    gameServices.setDefaultRoom(room);
    const firstPlayer = room.players[room.firstPlayerIndex];
    gameServices.notifyPlayerTurns(room, io, firstPlayer);
}

export const playCard = (socket, io, rooms, playerCard) => {
    const room = rooms.get(socket.data.roomId);
    const currentTurnIndex = room.currentTurnIndex;
    const currentPlayer = room.players[currentTurnIndex];
    if(socket.id !== currentPlayer.socketId) return socket.emit('not-your-turn', { message: `Wait for ${currentPlayer.name} turn` });

    const response = gameServices.handleCardPlay(socket, room, currentTurnIndex, playerCard);
    if (!response.success) return;
    gameServices.removeCardFromPlayer(socket, currentPlayer, playerCard);

    io.to(socket.data.roomId).emit('card-played', { playerName: currentPlayer.name, playerCard });

    room.currentTurnIndex = (currentTurnIndex + 1) % room.players.length;
    if (room.currentTurnIndex === room.firstPlayerIndex) return gameServices.handleRoundCompletion(socket, room, io);
    else {
        const nextPlayer = room.players[room.currentTurnIndex];
        gameServices.notifyPlayerTurns(room, io, nextPlayer);
    }
}

export const foldCard = (socket, io, rooms, playerCard) => {
    const room = rooms.get(socket.data.roomId);
    const currentTurnIndex = room.currentTurnIndex;
    const currentPlayer = room.players[currentTurnIndex];
    if(socket.id !== currentPlayer.socketId) return socket.emit('not-your-turn', { message: `Wait for ${currentPlayer.name} turn` });

    if(!room.cardWinner) return socket.emit('card-error', { message: `First player has to play` });
    gameServices.removeCardFromPlayer(socket, currentPlayer, playerCard);

    io.to(socket.data.roomId).emit('card-folded', { playerName: currentPlayer.name, playerCard: 'folded' });

    room.currentTurnIndex = (currentTurnIndex + 1) % room.players.length;
    if (room.currentTurnIndex === room.firstPlayerIndex) return gameServices.handleRoundCompletion(socket, room, io);
    else {
        const nextPlayer = room.players[room.currentTurnIndex];
        gameServices.notifyPlayerTurns(room, io, nextPlayer);
    }
}

export const hitCard = (socket, io, rooms, playerCard) => {
    const room = rooms.get(socket.data.roomId);
    if(!room.players.find(p => p.socketId === socket.id)?.hasTong) return socket.emit('not-your-turn', { message: 'You have lost by not having Tong' });

    gameServices.handleCardHit(socket, io, room, playerCard);
}

export const throwCard = (socket, io, rooms, playerCard) => {
    const room = rooms.get(socket.data.roomId);
    if(!room.players.find(p => p.socketId === socket.id)?.hasTong) return socket.emit('not-your-turn', { message: 'You have lost by not having Tong' });
    if (!room.hasHitCard) return socket.emit('card-error', { message: 'Cannot throw without having any card hit'});

    gameServices.handleCardThrow(socket, io, room, playerCard);
}

export const showResult = (socket, io, rooms) => {
    const room = rooms.get(socket.data.roomId);
    if(!room.hasFinishedHit) return socket.emit('game-error', { message: `Game hasn't finsihed hit card yet`});

    gameServices.handleShowResult(socket, io, room);
    gameServices.setDefaultRoom(room);
}