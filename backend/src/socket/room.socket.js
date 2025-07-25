import { faker } from "@faker-js/faker";

export const handleRoomEvents = (socket, io, rooms) => {
    socket.on('create-room', (roomName,playerName) => {
        if (socket.data.roomId) return socket.emit('room-error','You are already in a room');

        const roomId = faker.string.alphanumeric(6).toUpperCase();
        
        rooms.set(roomId, {
            name: roomName,
            players: [{ id: socket.id, name: playerName, cards: [] }]
        })

        socket.join(roomId);
        socket.data.playerName = playerName;
        socket.data.roomId = roomId;

        socket.emit('room-success', {roomId, message: 'Room created successfully'});
        io.emit('room-update', {roomId, roomName, playerCount: 1});
        console.log('Room created', roomId);
    });

    socket.on('join-room', (roomId, playerName) => {
        if (socket.data.roomId) return socket.emit('room-error','You are already in a room');
        if (!rooms.has(roomId)) return socket.emit('room-error','Room not found');
        
        const room = rooms.get(roomId);
        room.players.push({ id: socket.id, name: playerName, cards: [] });

        socket.join(roomId);
        socket.data.playerName = playerName;
        socket.data.roomId = roomId;

        socket.emit('room-success', {roomId, message: 'Join room successfully'});
        io.emit('room-update', {roomId, currentPlayers: room.players.map(p => p.name), playerCount: room.players.length});
        console.log('Room joined', roomId);
    });

    socket.on('leave-room', () => {
        const roomId = socket.data.roomId;

        const room = rooms.get(roomId);
        room.players = room.players.filter(p => p.id !== socket.id);

        socket.leave(roomId);
        socket.data.roomId = null;

        socket.emit('room-success', {roomId, message: 'Left room successfully'});
        io.emit('room-update', {roomId, currentPlayers: room.players.map(p => p.name), playerCount: room.players.length});
        console.log(`${socket.id} left room '${room.name}'`);

        if (room.players.length === 0) {
            rooms.delete(roomId);
            io.emit('room-update', { roomId, message: `Room '${room.name}' deleted as it is empty`});
            console.log(`Room '${room.name}' deleted as it is empty.`);
        }
    });
}