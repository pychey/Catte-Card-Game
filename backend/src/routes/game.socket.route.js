import { startGame, foldCard, hitCard, playCard, showResult, throwCard } from "../controllers/game.socket.controller.js";

const handleGameEvents = (socket, io, rooms) => {
    socket.on('start-game', () => startGame(socket, io, rooms));
    socket.on('play-card', (playerCard) => playCard(socket, io, rooms, playerCard));
    socket.on('fold-card', (playerCard) => foldCard(socket, io, rooms, playerCard));
    socket.on('hit-card', (playerCard) => hitCard(socket, io, rooms, playerCard));
    socket.on('throw-card', (playerCard) => throwCard(socket, io, rooms, playerCard));
    socket.on('show-result', () => showResult(socket, io, rooms));
}

export default handleGameEvents;