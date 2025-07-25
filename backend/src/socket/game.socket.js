const buildDeck = () => {
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'A', 'J', 'Q', 'K'];
    const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
    let deck = [];

    for (const suit of suits) {
        for (const value of values) {
            deck.push({ value, suit });
        }
    }

    return deck;
}

const shuffleDeck = (deck) => {
    for( let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

const startGame = (room) => {
    const tempDeck = [...room.deck];
    for (const player of room.players) { player.cards.length = 0; player.hasTong = false; player.hasHitCard = false; player.hitCard = undefined; player.underCard = undefined }
    for (let i = 0; i < 6; i++) {
        for (const player of room.players) {
            const card = tempDeck.pop();
            player.cards.push(card);
        }
    }
}

const isCardHigher = (playerCard, opponentCard) => {
    const valueRank = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13, A: 14 };
    return valueRank[playerCard.value] > valueRank[opponentCard.value];
}

const setDefaultRoom = (room) => {
    room.roundNumber = 1;
    room.firstPlayerIndex = room.lastWinnerIndex ? room.lastWinnerIndex : 0;
    room.currentTurnIndex = room.lastWinnerIndex ? room.lastWinnerIndex : 0;
    room.cardWinner = undefined;
    room.firstPlayerToHitIndex = undefined;
    room.winningHitCard = undefined;
    room.winningHitCardPlayer = undefined;
    room.hasHitCard = false;
    room.hasFinishedHit = false;
};

export const handleGameEvents = (socket, io, rooms) => {
    socket.on('play-game', () => {
        if(!socket.data.roomId) return socket.emit('game-error', { message: 'You are not in a room'});
        const roomId = socket.data.roomId;
        const room = rooms.get(roomId);
        if (room.players.length < 2) return socket.emit('game-error', { message: 'Not enough players in room'});

        if (!room.deck) room.deck = buildDeck();
        shuffleDeck(room.deck);
        startGame(room);

        room.players.forEach(player => io.to(player.id).emit('game-started', { yourCard: player.cards }));

        setDefaultRoom(room);
        const firstPlayer = room.players[room.firstPlayerIndex];
        io.to(firstPlayer.id).emit('your-turn', { yourCard: firstPlayer.cards });
        for (const player of room.players) {
            if (player.id !== firstPlayer.id) {
                io.to(player.id).emit('not-your-turn', { message: `Wait for ${firstPlayer.name} turn` });
            }
        }
    });

    socket.on('play-card', (playerCard) => {
        const room = rooms.get(socket.data.roomId);
        const currentTurnIndex = room.currentTurnIndex;
        const currentPlayer = room.players[currentTurnIndex];
        if(socket.id !== currentPlayer.id) return socket.emit('not-your-turn', { message: `Wait for ${currentPlayer.name} turn` });

        if (!room.cardWinner) room.cardWinner = { playerIndex: currentTurnIndex, card: playerCard };
        else {
            if (playerCard.suit !== room.cardWinner.card.suit) return socket.emit('card-error', { message: 'Card need to be the same suit' });
            const isWin = isCardHigher(playerCard, room.cardWinner.card);
            if (isWin) room.cardWinner = { playerIndex: currentTurnIndex, card: playerCard };
            else return socket.emit('card-error', { message: 'Card is not higher' });
        }

        currentPlayer.cards = currentPlayer.cards.filter(c => !(c.value === playerCard.value && c.suit === playerCard.suit));

        io.to(socket.data.roomId).emit('card-played', { playerName: currentPlayer.name, playerCard });

        room.currentTurnIndex = (currentTurnIndex + 1) % room.players.length;
        if (room.currentTurnIndex === room.firstPlayerIndex) { 
            const winnerPlayer = room.players[room.cardWinner.playerIndex];
            io.to(socket.data.roomId).emit('round-winner', { winnerPlayer: winnerPlayer.name, winningCard: room.cardWinner.card });
            winnerPlayer.hasTong = true;
            room.roundNumber += 1;

            if (room.roundNumber === 5) {
                room.firstPlayerToHitIndex = room.cardWinner.playerIndex;
                room.cardWinner = undefined;
                
                return setTimeout(() => {
                    io.to(winnerPlayer.id).emit('your-turn', { message: 'Your turn to hit', yourCard: winnerPlayer.cards });
                    for (const player of room.players) {
                        if (player.id !== winnerPlayer.id  && player.hasTong) {
                            io.to(player.id).emit('not-your-turn', { message: `Wait for ${winnerPlayer.name} to hit` });
                        } else if (player.id !== winnerPlayer.id  && !player.hasTong) {
                            io.to(player.id).emit('not-your-turn', { message: 'You have lost by not having Tong' });
                        }
                    }
                }, 1000);
            }

            room.firstPlayerIndex = room.cardWinner.playerIndex;
            room.currentTurnIndex = room.firstPlayerIndex;
            room.cardWinner = undefined;

            setTimeout(() => {
                io.to(winnerPlayer.id).emit('your-turn', { yourCard: winnerPlayer.cards });
                for (const player of room.players) {
                    if (player.id !== winnerPlayer.id) {
                        io.to(player.id).emit('not-your-turn', { message: `Wait for ${winnerPlayer.name} turn` });
                    }
                }
            }, 1000);
        } else {
            const nextPlayer = room.players[room.currentTurnIndex];
            io.to(nextPlayer.id).emit('your-turn', { yourCard: nextPlayer.cards });
            for (const player of room.players) {
                if (player.id !== nextPlayer.id) {
                    io.to(player.id).emit('not-your-turn', { message: `Wait for ${nextPlayer.name} turn` });
                }
            }
        }
    });

    socket.on('fold-card', (playerCard) => {
        const room = rooms.get(socket.data.roomId);
        const currentTurnIndex = room.currentTurnIndex;
        const currentPlayer = room.players[currentTurnIndex];
        if(socket.id !== currentPlayer.id) return socket.emit('not-your-turn', { message: `Wait for ${currentPlayer.name} turn` });

        currentPlayer.cards = currentPlayer.cards.filter(c => !(c.value === playerCard.value && c.suit === playerCard.suit));

        io.to(socket.data.roomId).emit('card-folded', { playerName: currentPlayer.name, playerCard: 'folded' });

        room.currentTurnIndex = (currentTurnIndex + 1) % room.players.length;
        if (room.currentTurnIndex === room.firstPlayerIndex) { 
            const winnerPlayer = room.players[room.cardWinner.playerIndex];
            io.to(socket.data.roomId).emit('round-winner', { winnerPlayer: winnerPlayer.name, winningCard: room.cardWinner.card });
            winnerPlayer.hasTong = true;
            room.roundNumber += 1

            if (room.roundNumber === 5) {
                room.firstPlayerToHitIndex = room.cardWinner.playerIndex;
                room.cardWinner = undefined;
                
                return setTimeout(() => {
                    io.to(winnerPlayer.id).emit('your-turn', { message: 'Your turn to hit', yourCard: winnerPlayer.cards });
                    for (const player of room.players) {
                        if (player.id !== winnerPlayer.id  && player.hasTong) {
                            io.to(player.id).emit('not-your-turn', { message: `Wait for ${winnerPlayer.name} to hit` });
                        } else if (player.id !== winnerPlayer.id  && !player.hasTong) {
                            io.to(player.id).emit('not-your-turn', { message: 'You have lost by not having Tong' });
                        }
                    }
                }, 1000);
            }

            room.firstPlayerIndex = room.cardWinner.playerIndex;
            room.currentTurnIndex = room.firstPlayerIndex;
            room.cardWinner = undefined;

            setTimeout(() => {
                io.to(winnerPlayer.id).emit('your-turn', { yourCard: winnerPlayer.cards });
                for (const player of room.players) {
                    if (player.id !== winnerPlayer.id) {
                        io.to(player.id).emit('not-your-turn', { message: `Wait for ${winnerPlayer.name} turn` });
                    }
                }
            }, 1000);
        } else {
            const nextPlayer = room.players[room.currentTurnIndex];
            io.to(nextPlayer.id).emit('your-turn', { yourCard: nextPlayer.cards });
            for (const player of room.players) {
                if (player.id !== nextPlayer.id) {
                    io.to(player.id).emit('not-your-turn', { message: `Wait for ${nextPlayer.name} turn` });
                }
            }
        }
    });

    socket.on('hit-card', (playerCard) => {
        const room = rooms.get(socket.data.roomId);
        if(!room.players.find(p => p.id === socket.id)?.hasTong) return socket.emit('not-your-turn', { message: 'You have lost by not having Tong' });

        if (!room.hasHitCard) {
            const firstPlayerToHitIndex = room.firstPlayerToHitIndex;
            const firstPlayerToHit = room.players[firstPlayerToHitIndex];
            if(socket.id !== firstPlayerToHit.id) return socket.emit('not-your-turn', { message: `Wait for ${firstPlayerToHit.name} to hit` });

            firstPlayerToHit.cards = firstPlayerToHit.cards.filter(c => !(c.value === playerCard.value && c.suit === playerCard.suit));

            room.hasHitCard = true;
            room.winningHitCard = playerCard;
            room.winningHitCardPlayer = firstPlayerToHit;
            firstPlayerToHit.hasHitCard = true;
            firstPlayerToHit.hitCard = playerCard;
            firstPlayerToHit.underCard = firstPlayerToHit.cards[0];

            io.to(socket.data.roomId).emit('card-hit', { playerName: firstPlayerToHit.name, playerCard: { cardHit: playerCard, cardUnder: 'Unrevealed'} });
            for (const player of room.players) {
                if (player.id !== firstPlayerToHit.id && player.hasTong) {
                    io.to(player.id).emit('your-turn', { message: `Hit or Throw`, yourCard: player.cards});
                }
            }
        } else {
            const hittingPlayer = room.players.find(p => p.id === socket.id);
            const remainingPlayers = room.players.filter(p => p.hasTong && !p.hasHitCard && p.id !== hittingPlayer.id).map(p => p.name);

            if (hittingPlayer.hasHitCard) return socket.emit('not-your-turn', { message: 'You already hit your card'});

            hittingPlayer.cards = hittingPlayer.cards.filter(c => !(c.value === playerCard.value && c.suit === playerCard.suit));
            hittingPlayer.hasHitCard = true;
            hittingPlayer.hitCard = playerCard;
            hittingPlayer.underCard = hittingPlayer.cards[0];

            if (remainingPlayers.length === 0) {
                io.to(socket.data.roomId).emit('card-hit', { playerName: hittingPlayer.name, playerCard: { cardHit: playerCard, cardUnder: 'Unrevealed'}});
                io.to(socket.data.roomId).emit('all-hit', { message: 'Players have all hit their cards' });
                room.hasFinishedHit = true;
            } else {
                io.to(socket.data.roomId).emit('card-hit', { playerName: hittingPlayer.name, playerCard: { cardHit: playerCard, cardUnder: 'Unrevealed'}, remainingPlayers });
            }
        }
    });

    socket.on('throw-card', (playerCard) => {
        const room = rooms.get(socket.data.roomId);
        if(!room.players.find(p => p.id === socket.id)?.hasTong) return socket.emit('not-your-turn', { message: 'You have lost by not having Tong' });
        if (!room.hasHitCard) return socket.emit('card-error', { message: 'Cannot throw without having any card hit'});

        const throwingPlayer = room.players.find(p => p.id === socket.id);
        const remainingPlayers = room.players.filter(p => p.hasTong && !p.hasHitCard && p.id !== throwingPlayer.id).map(p => p.name);

        if (throwingPlayer.hasHitCard) return socket.emit('not-your-turn', { message: 'You already hit your card'});
        if (playerCard.suit !== room.winningHitCard.suit) return socket.emit('card-error', { message: 'Card need to be the same suit' });
        const isWin = isCardHigher(playerCard, room.winningHitCard);
        if (!isWin) return socket.emit('card-error', { message: 'Card is not higher' });

        throwingPlayer.cards = throwingPlayer.cards.filter(c => !(c.value === playerCard.value && c.suit === playerCard.suit));

        room.winningHitCard = playerCard;
        room.winningHitCardPlayer = throwingPlayer;
        throwingPlayer.hasHitCard = true;
        throwingPlayer.hitCard = playerCard;
        throwingPlayer.underCard = throwingPlayer.cards[0];

        if (remainingPlayers.length === 0) {
            io.to(socket.data.roomId).emit('card-throw', { playerName: throwingPlayer.name, playerCard: { cardHit: playerCard, cardUnder: 'Unrevealed'}});
            io.to(socket.data.roomId).emit('all-hit', { message: 'Players have all hit their cards' });
            room.hasFinishedHit = true;
        } else {
            io.to(socket.data.roomId).emit('card-hit', { playerName: throwingPlayer.name, playerCard: { cardHit: playerCard, cardUnder: 'Unrevealed'}, remainingPlayers });
        }
    });

    socket.on('show-result', () => {
        const room = rooms.get(socket.data.roomId);
        if(!room.hasFinishedHit) return socket.emit('game-error', { message: `Game hasn't finsihed hit card yet`});

        const resultRevealed = [];
        for (const player of room.players) resultRevealed.push({ player, hitCard:player.hitCard, revealedCard: player.underCard });

        const winningHitCardPlayer = room.winningHitCardPlayer;
        let gameWinner = winningHitCardPlayer;
        let highestCard = winningHitCardPlayer.underCard;

        io.to(socket.data.roomId).emit('reveal-card', {
            message: 'Reveal card stage, no winner has declared yet',
            winningHitCardPlayer: {
                name: winningHitCardPlayer.name,
                hitCard: winningHitCardPlayer.hitCard,
                revealedCard: winningHitCardPlayer.underCard
            },
            otherTongPlayer: resultRevealed.filter(result => result.player.id !== winningHitCardPlayer.id).map(result => ({
                name: result.player.name,
                hitCard: result.hitCard,
                revealedCard: result.revealedCard
            }))
        });

        for (const result of resultRevealed) {
            if (result.revealedCard.suit !== highestCard.suit) continue;
            if (isCardHigher(result.revealedCard, highestCard)) {
                highestCard = result.revealedCard;
                gameWinner = result.player;
            }
        }

        setTimeout(() => {
            io.to(socket.data.roomId).emit('game-result', {
                gameWinner: {
                    name: gameWinner.name,
                    hitCard: gameWinner.hitCard,
                    revealedCard: gameWinner.underCard
                }
            });
        }, 2000);

        room.lastWinnerIndex = room.players.findIndex(p => p.id === gameWinner.id);
        setDefaultRoom(room);
    });
}