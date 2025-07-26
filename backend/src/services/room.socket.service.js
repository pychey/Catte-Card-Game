export const handleRoomCreation = (socket, rooms, roomId, roomName) => {
    rooms.set(roomId, { name: roomName, players: [{ socketId: socket.id, playerId: socket.data.player.id, name: socket.data.playerName, cards: [] }]});

    socket.join(roomId);
    socket.data.roomId = roomId;
}

export const handleRoomJoin = (socket, roomId, room) => {
    room.players.push({ socketId: socket.id, playerId: socket.data.player.id, name: socket.data.playerName, cards: [] });

    socket.join(roomId);
    socket.data.roomId = roomId;
}

export const handleRoomLeave = (socket, roomId, room) => {
    room.players = room.players.filter(p => p.socketId !== socket.id);

    socket.leave(roomId);
    socket.data.roomId = undefined;
}

export const handleRoomDeletion = (io, rooms, roomId, room) => {
    if (room.players.length === 0) {
        rooms.delete(roomId);
        io.emit('room-update', { roomId, message: `Room '${room.name}' deleted as it is empty`});
        console.log(`Room '${room.name}' deleted as it is empty.`);
    }
};