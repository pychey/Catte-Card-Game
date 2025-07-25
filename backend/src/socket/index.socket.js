import { io } from "../utils/socket.utils.js";
import handleRoomEvents from "../routes/room.socket.route.js";
import handleGameEvents from "../routes/game.socket.route.js";
import { handleRoomDeletion } from "../services/room.socket.service.js";
import Player from "../models/player.model.js";

const connectedUsers = new Set();
const rooms = new Map();

io.on('connection', (socket) => {
    connectedUsers.add(socket.id);
    console.log('Player connected', socket.id);
    console.log("Online", connectedUsers.size);

    socket.data.playerName = undefined;
    socket.data.roomId = undefined;
    socket.data.player = undefined;

    socket.on('authenticate', async (playerData) => {
        try {
            const player = await Player.findByPk(playerData.playerId);
            if (!player) return socket.emit('authenticated', { success: false, message: 'Authentication failed' });
            socket.data.player = player;
            socket.data.playerName = player.username;
            socket.emit('authenticated', { success: true, player: { id: player.id, username: player.username, isGuest: player.isGuest } });
        } catch (error) {
            socket.emit('authenticated', { success: false, message: 'Authentication failed' });
        }
    });

    handleRoomEvents(socket, io, rooms);
    handleGameEvents(socket, io, rooms);

    socket.on('disconnect', () => {
        connectedUsers.delete(socket.id);
        console.log('Player disconnected', socket.id);

        const disconnectedRoomId = socket.data.roomId;

        if (disconnectedRoomId) {
            const room = rooms.get(disconnectedRoomId);
            room.players = room.players.filter( p => p.id !== socket.id);
            io.emit('room-update', { roomId: disconnectedRoomId, playerCount: room.players.length});

            console.log(`${socket.id} disconnect from room '${room.name}'`);

            handleRoomDeletion(io, rooms, disconnectedRoomId, room);
        } 
        
        console.log("Online", connectedUsers.size);
    });
});