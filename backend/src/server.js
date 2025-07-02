// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const PORT = process.env.PORT || 3001;
const rooms = new Map();

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11-J, 12-Q, 13-K, 14-A
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

function getWinner(cardA, cardB) {
  if (cardA.value > cardB.value) return 0;
  if (cardB.value > cardA.value) return 1;
  return -1;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, playerName }) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { players: [] });
    }

    const room = rooms.get(roomId);
    if (room.players.length >= 2) return;

    room.players.push({ id: socket.id, name: playerName, card: null });
    io.to(roomId).emit('room-update', room.players.map(p => p.name));

    if (room.players.length === 2) {
      const deck = createDeck().sort(() => Math.random() - 0.5);
      room.players[0].card = deck.pop();
      room.players[1].card = deck.pop();

      room.played = [];
      room.deck = deck;
      room.finished = false;

      room.players.forEach(player => {
        io.to(player.id).emit('game-started', {
          yourCard: player.card,
        });
      });
    }
  });

  socket.on('play-card', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.finished) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.card) return;

    if (!room.played.find(p => p.id === socket.id)) {
      room.played.push({ id: socket.id, card: player.card });
    }

    if (room.played.length === 2) {
      const [a, b] = room.played;
      const winnerIndex = getWinner(a.card, b.card);
      const winner = winnerIndex >= 0 ? room.players[winnerIndex] : null;

      io.to(roomId).emit('game-result', {
        cards: room.played,
        winner: winner ? winner.name : 'Draw',
      });

      room.finished = true;
    }
  });

  socket.on('reset', (roomId) => {
    rooms.delete(roomId);
    io.to(roomId).emit('go-home');
  });

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms) {
      room.players = room.players.filter(p => p.id !== socket.id);
      if (room.players.length === 0) rooms.delete(roomId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
