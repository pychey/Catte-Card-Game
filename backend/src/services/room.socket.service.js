export const handleRoomCreation = (socket, rooms, roomId, roomName, playerName) => {
    rooms.set(roomId, { name: roomName, players: [{ id: socket.id, name: playerName, cards: [] }]});

    socket.join(roomId);
    socket.data.playerName = playerName;
    socket.data.roomId = roomId;
}

export const handleRoomJoin = (socket, roomId, room, playerName) => {
    room.players.push({ id: socket.id, name: playerName, cards: [] });

    socket.join(roomId);
    socket.data.playerName = playerName;
    socket.data.roomId = roomId;
}

export const handleRoomLeave = (socket, roomId, room) => {
    room.players = room.players.filter(p => p.id !== socket.id);

    socket.leave(roomId);
    socket.data.roomId = null;
}

export const handleRoomDeletion = (io, rooms, roomId, room) => {
    if (room.players.length === 0) {
        rooms.delete(roomId);
        io.emit('room-update', { roomId, message: `Room '${room.name}' deleted as it is empty`});
        console.log(`Room '${room.name}' deleted as it is empty.`);
    }
};