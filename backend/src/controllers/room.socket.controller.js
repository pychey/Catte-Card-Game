import * as roomServices from '../services/room.socket.service.js';
import { faker } from "@faker-js/faker";

export const createRoom = (socket, io, rooms, roomName) => {
    if (socket.data.roomId) return socket.emit('room-error','You are already in a room');

    const roomId = faker.string.alphanumeric(6).toUpperCase();
    roomServices.handleRoomCreation(socket, rooms, roomId, roomName);

    socket.emit('room-success', {roomId, message: 'Room created successfully'});
    socket.emit('room-players', { players: rooms.get(roomId).players });
    io.emit('room-update', {roomId, roomName, playerCount: 1, isGamePlaying: false});
    console.log('Room created', roomId);
}

export const joinRoom = (socket, io, rooms, roomId) => {
    if (socket.data.roomId) return socket.emit('room-error','You are already in a room');
    if (!rooms.has(roomId)) return socket.emit('room-error','Room not found');

    const room = rooms.get(roomId);
    if (room.players.length >= 4) return socket.emit('room-error','Room is full');
    if (room.gameStarted) return socket.emit('room-error','Cannot join - game is in progress');
    roomServices.handleRoomJoin(socket, roomId, room);

    socket.emit('room-success', {roomId, message: 'Join room successfully'});
    socket.emit('room-players', { players: room.players });
    socket.to(roomId).emit('player-joined', { player: { playerId: socket.data.player.id, name: socket.data.playerName } });
    io.emit('room-update', {roomId, playerCount: room.players.length, isGamePlaying: room.gameStarted || false});
    console.log('Room joined', roomId);
}

export const leaveRoom = (socket, io, rooms) => {
    const roomId = socket.data.roomId;
    
    if (!roomId) {
        return socket.emit('room-error', 'You are not in a room');
    }

    const room = rooms.get(roomId);
    if (!room) {
        return socket.emit('room-error', 'Room not found');
    }

    socket.to(roomId).emit('player-left', { playerId: socket.data.player.id });
    roomServices.handleRoomLeave(socket, roomId, room);

    if (room.players.length > 0) {
        roomServices.resetGameState(room);
        io.to(roomId).emit('game-reset', { message: 'A Player Left' });
    }

    socket.emit('room-success', {roomId, message: 'Left room successfully'});
    io.emit('room-update', {roomId, playerCount: room.players.length, isGamePlaying: room.gameStarted || false});
    console.log(`${socket.id} left room '${room.name}'`);

    roomServices.handleRoomDeletion(io, rooms, roomId, room);
}

export const getRoomInfo = (socket, rooms) => {
    const roomId = socket.data.roomId;
    
    const room = rooms.get(roomId);
    socket.emit('room-players', { players: room.players });
}

export const getActiveRooms = (io, rooms) => {
    const roomsList = Array.from(rooms.entries()).map(([roomId, room]) => ({
        roomId,
        roomName: room.name,
        playerCount: room.players.length,
        isGamePlaying: room.gameStarted || false
    }));
    
    io.emit('active-rooms', { rooms: roomsList });
}