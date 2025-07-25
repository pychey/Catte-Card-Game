import { createRoom, joinRoom, leaveRoom } from "../controllers/room.socket.controller.js";

const handleRoomEvents = (socket, io, rooms) => {
    socket.on('create-room', (roomName, playerName) => createRoom(socket, io, rooms, roomName, playerName));
    socket.on('join-room', (roomId, playerName) => joinRoom(socket, io, rooms, roomId, playerName));
    socket.on('leave-room', () => leaveRoom(socket, io, rooms));
}

export default handleRoomEvents;