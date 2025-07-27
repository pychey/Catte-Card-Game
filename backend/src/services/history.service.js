import History from "../models/history.model.js";

export const saveGameHistory = async (room, gameWinner) => {
    try {
        await Promise.all( room.players.map(player => 
            History.create({ result: player.playerId === gameWinner.playerId ? `Won` : `Lost` })
                .then(history => history.addPlayer(player.playerId))
            )
        );
        console.log('Game history saved successfully');
    } catch (error) {
        console.error(error.message);
    }
};

