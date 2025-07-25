import { createRoom, joinRoom, leaveRoom } from "../controllers/room.socket.controller.js";

const handleRoomEvents = (socket, io, rooms) => {
    socket.on('create-room', (roomName) => createRoom(socket, io, rooms, roomName));
    socket.on('join-room', (roomId) => joinRoom(socket, io, rooms, roomId));
    socket.on('leave-room', () => leaveRoom(socket, io, rooms));
}

export default handleRoomEvents;