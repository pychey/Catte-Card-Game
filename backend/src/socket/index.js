//Later: Use room's players as map to avoid removing 2 players with the same name when deleting

import { faker } from "@faker-js/faker";
import { io } from "../utils/socket.js";

const connectedUsers = new Set();
const rooms = new Map();

io.on('connection', (socket) => {
    connectedUsers.add(socket.id);
    console.log('Player connected', socket.id);
    console.log("Online", connectedUsers.size);

    socket.data.playerName = null;
    socket.data.roomId = null;

    socket.on('create-room', (roomName,playerName) => {
        if (socket.data.roomId) return socket.emit('room-error','You are already in a room');

        const roomId = faker.string.alphanumeric(6).toUpperCase();
        
        rooms.set(roomId, {
            name: roomName,
            players: [playerName]
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
        room.players.push(playerName);

        socket.join(roomId);
        socket.data.playerName = playerName;
        socket.data.roomId = roomId;

        socket.emit('room-success', {roomId, message: 'Join room successfully'});
        io.emit('room-update', {roomId, currentPlayers: room.players, playerCount: room.players.length});
        console.log('Room joined', roomId);
    });

    socket.on('disconnect', () => {
        connectedUsers.delete(socket.id);
        console.log('Player disconnected', socket.id);

        const disconnectedRoomId = socket.data.roomId;
        const disconnectedPlayerName = socket.data.playerName;

        if (disconnectedPlayerName && disconnectedRoomId) {
            const room = rooms.get(disconnectedRoomId);
            room.players = room.players.filter( p => p !== disconnectedPlayerName);
            io.emit('room-update', { roomId: disconnectedRoomId, currentPlayers: room.players, playerCount: room.players.length});

            console.log(`${socket.id} left room '${room.name}'`);

            if (room.players.length === 0) {
                rooms.delete(disconnectedRoomId);
                io.emit('room-update', { roomId: disconnectedRoomId, message: `Room '${room.name}' deleted as it is empty`});
                console.log(`Room '${room.name}' deleted as it is empty.`);
            }
        } 
        
        console.log("Online", connectedUsers.size);
    });
});