import { saveGameHistory } from "./history.service.js";

export const buildDeck = () => {
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

export const shuffleDeck = (deck) => {
    for( let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

export const startGame = (room) => {
    const tempDeck = [...room.deck];
    for (const player of room.players) { player.cards.length = 0; player.hasTong = false; player.hasHitCard = false; player.hitCard = undefined; player.underCard = undefined }
    for (let i = 0; i < 6; i++) {
        for (const player of room.players) {
            const card = tempDeck.pop();
            player.cards.push(card);
        }
    }
}

export const notifyPlayerTurns = (room, io, currentPlayer) => {
    io.to(currentPlayer.socketId).emit('your-turn', { message: 'Your turn to play!', yourCard: currentPlayer.cards });
    for (const player of room.players) {
        if (player.socketId !== currentPlayer.socketId) {
            io.to(player.socketId).emit('not-your-turn', { message: `Wait for ${currentPlayer.name} turn`, yourCard: player.cards });
        }
    }
};

export const isCardHigher = (playerCard, opponentCard) => {
    const valueRank = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13, A: 14 };
    return valueRank[playerCard.value] > valueRank[opponentCard.value];
}

export const handleCardPlay = (socket, room, currentTurnIndex, playerCard) => {
    if (!room.cardWinner) room.cardWinner = { playerIndex: currentTurnIndex, card: playerCard };
    else {
        if (playerCard.suit !== room.cardWinner.card.suit) return socket.emit('card-error', { message: 'Card need to be the same suit' });
        const isWin = isCardHigher(playerCard, room.cardWinner.card);
        if (isWin) room.cardWinner = { playerIndex: currentTurnIndex, card: playerCard };
        else return socket.emit('card-error', { message: 'Card is not higher' });
    }
    return { success: true };
}

export const removeCardFromPlayer = (socket, player, card) => {
    player.cards = player.cards.filter(c => !(c.value === card.value && c.suit === card.suit));
    socket.emit('card-removed', { yourCard: player.cards });
};

export const handleRoundCompletion = (socket, room, io) => {
    const winnerPlayer = room.players[room.cardWinner.playerIndex];
    io.to(socket.data.roomId).emit('round-winner', { winnerPlayer: winnerPlayer.name, winningCard: room.cardWinner.card });
    winnerPlayer.hasTong = true;
    room.roundNumber += 1;

    if (room.roundNumber === 5) {
        const isRevealStage = checkPlayerTong(room, winnerPlayer);
        if (!isRevealStage) return handleShowResultNoRevealStage(socket, io, room, winnerPlayer);
        room.firstPlayerToHitIndex = room.cardWinner.playerIndex;
        room.cardWinner = undefined;
        
        return setTimeout(() => {
            io.to(winnerPlayer.socketId).emit('your-turn', { message: 'Your turn to Hit!', yourCard: winnerPlayer.cards });
            for (const player of room.players) {
                if (player.socketId !== winnerPlayer.socketId  && player.hasTong) {
                    io.to(player.socketId).emit('not-your-turn', { message: `Wait for ${winnerPlayer.name} to hit`, yourCard: player.cards });
                } else if (player.socketId !== winnerPlayer.socketId  && !player.hasTong) {
                    io.to(player.socketId).emit('not-your-turn', { message: 'You have lost by not having Tong' });
                }
            }
        }, 1000);
    }

    room.firstPlayerIndex = room.cardWinner.playerIndex;
    room.currentTurnIndex = room.firstPlayerIndex;
    room.cardWinner = undefined;

    setTimeout(() => {
        notifyPlayerTurns(room, io, winnerPlayer);
    }, 1000);
};

export const checkPlayerTong = (room, winnerPlayer) => {
    let isRevealStage = false;
    for (const player of room.players) {
        if (player.socketId !== winnerPlayer.socketId  && player.hasTong) {
            isRevealStage = true;
        }
    }
    return isRevealStage;
}

export const handleCardHit = (socket, io, room, playerCard) => {
    if (!room.hasHitCard) {
        const firstPlayerToHitIndex = room.firstPlayerToHitIndex;
        const firstPlayerToHit = room.players[firstPlayerToHitIndex];
        if(socket.id !== firstPlayerToHit.socketId) return socket.emit('not-your-turn', { message: `Wait for ${firstPlayerToHit.name} to hit` });

        removeCardFromPlayer(socket, firstPlayerToHit, playerCard);

        room.hasHitCard = true;
        room.winningHitCard = playerCard;
        room.winningHitCardPlayer = firstPlayerToHit;
        firstPlayerToHit.hasHitCard = true;
        firstPlayerToHit.hitCard = playerCard;
        firstPlayerToHit.underCard = firstPlayerToHit.cards[0];

        io.to(socket.data.roomId).emit('card-hit', { playerName: firstPlayerToHit.name, playerCard: { cardHit: playerCard, cardUnder: 'Unrevealed'} });
        for (const player of room.players) {
            if (player.socketId !== firstPlayerToHit.socketId && player.hasTong) {
                io.to(player.socketId).emit('your-turn', { message: `Hit or Throw`, yourCard: player.cards});
            }
        }
    } else {
        const hittingPlayer = room.players.find(p => p.socketId === socket.id);
        const remainingPlayers = room.players.filter(p => p.hasTong && !p.hasHitCard && p.socketId !== hittingPlayer.socketId).map(p => p.name);

        if (hittingPlayer.hasHitCard) return socket.emit('not-your-turn', { message: 'You already hit your card'});

        removeCardFromPlayer(socket, hittingPlayer, playerCard);
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
}

export const handleCardThrow = (socket, io, room, playerCard) => {
    const throwingPlayer = room.players.find(p => p.socketId === socket.id);
    const remainingPlayers = room.players.filter(p => p.hasTong && !p.hasHitCard && p.socketId !== throwingPlayer.socketId).map(p => p.name);

    if (throwingPlayer.hasHitCard) return socket.emit('not-your-turn', { message: 'You already hit your card'});
    if (playerCard.suit !== room.winningHitCard.suit) return socket.emit('card-error', { message: 'Card need to be the same suit' });
    const isWin = isCardHigher(playerCard, room.winningHitCard);
    if (!isWin) return socket.emit('card-error', { message: 'Card is not higher' });

    removeCardFromPlayer(socket, throwingPlayer, playerCard);

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
        io.to(socket.data.roomId).emit('card-throw', { playerName: throwingPlayer.name, playerCard: { cardHit: playerCard, cardUnder: 'Unrevealed'}, remainingPlayers });
    }
}

export const handleShowResultNoRevealStage = (socket, io, room, gameWinner) => {
    setTimeout(async () => {
        io.to(socket.data.roomId).emit('game-result', {
            gameWinner: {
                name: gameWinner.name
            }
        });
        await saveGameHistory(room, gameWinner);
    }, 2000);

    room.lastWinnerIndex = room.players.findIndex(p => p.socketId === gameWinner.socketId);
}

export const handleShowResult = (socket, io, room) => {
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

    setTimeout(async () => {
        io.to(socket.data.roomId).emit('game-result', {
            gameWinner: {
                name: gameWinner.name,
                hitCard: gameWinner.hitCard,
                revealedCard: gameWinner.underCard
            }
        });
        await saveGameHistory(room, gameWinner);
    }, 2000);

    room.lastWinnerIndex = room.players.findIndex(p => p.socketId === gameWinner.socketId);
}

export const setDefaultRoom = (room) => {
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