//Might need to remove currentPlayer when emitting

import { io } from "../utils/socket.utils.js";
import { handleGameEvents } from "./game.socket.js";
import { handleRoomEvents } from "./room.socket.js";

const connectedUsers = new Set();
const rooms = new Map();

io.on('connection', (socket) => {
    connectedUsers.add(socket.id);
    console.log('Player connected', socket.id);
    console.log("Online", connectedUsers.size);

    socket.data.playerName = null;
    socket.data.roomId = null;

    handleRoomEvents(socket, io, rooms);
    handleGameEvents(socket, io, rooms);

    socket.on('disconnect', () => {
        connectedUsers.delete(socket.id);
        console.log('Player disconnected', socket.id);

        const disconnectedRoomId = socket.data.roomId;

        if (disconnectedRoomId) {
            const room = rooms.get(disconnectedRoomId);
            room.players = room.players.filter( p => p.id !== socket.id);
            io.emit('room-update', { roomId: disconnectedRoomId, currentPlayers: room.players.map(p => p.name), playerCount: room.players.length});

            console.log(`${socket.id} disconnect from room '${room.name}'`);

            if (room.players.length === 0) {
                rooms.delete(disconnectedRoomId);
                io.emit('room-update', { roomId: disconnectedRoomId, message: `Room '${room.name}' deleted as it is empty`});
                console.log(`Room '${room.name}' deleted as it is empty.`);
            }
        } 
        
        console.log("Online", connectedUsers.size);
    });
});