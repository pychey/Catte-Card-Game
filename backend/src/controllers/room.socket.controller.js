import * as roomServices from '../services/room.socket.service.js';
import { faker } from "@faker-js/faker";

export const createRoom = (socket, io, rooms, roomName, playerName) => {
    if (socket.data.roomId) return socket.emit('room-error','You are already in a room');

    const roomId = faker.string.alphanumeric(6).toUpperCase();
    roomServices.handleRoomCreation(socket, rooms, roomId, roomName, playerName);

    socket.emit('room-success', {roomId, message: 'Room created successfully'});
    io.emit('room-update', {roomId, roomName, playerCount: 1});
    console.log('Room created', roomId);
}

export const joinRoom = (socket, io, rooms, roomId, playerName) => {
    if (socket.data.roomId) return socket.emit('room-error','You are already in a room');
    if (!rooms.has(roomId)) return socket.emit('room-error','Room not found');

    const room = rooms.get(roomId);
    roomServices.handleRoomJoin(socket, roomId, room, playerName);

    socket.emit('room-success', {roomId, message: 'Join room successfully'});
    io.emit('room-update', {roomId, playerCount: room.players.length});
    console.log('Room joined', roomId);
}

export const leaveRoom = (socket, io, rooms) => {
    const roomId = socket.data.roomId;

    const room = rooms.get(roomId);
    roomServices.handleRoomLeave(socket, roomId, room);

    socket.emit('room-success', {roomId, message: 'Left room successfully'});
    io.emit('room-update', {roomId, playerCount: room.players.length});
    console.log(`${socket.id} left room '${room.name}'`);

    roomServices.handleRoomDeletion(io, rooms, roomId, room);
}