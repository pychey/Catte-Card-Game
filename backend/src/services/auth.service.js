import bcrypt from 'bcrypt';
import Player from "../models/player.model.js";
import History from "../models/history.model.js";

export const getPlayerHistory = async (playerId) => {
    const histories = await History.findAll({
        include: [{
            model: Player,
            where: { id: playerId },
            through: { attributes: [] }
        }],
        order: [['createdAt', 'DESC']],
        limit: 20 // Get last 20 games
    });
    
    const totalGames = histories.length;
    const wins = histories.filter(h => h.result === 'Won').length;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;
    
    // Format recent games for frontend
    const recentGames = histories.slice(0, 10).map(history => ({
        result: history.result === 'Won' ? 'win' : 'lost', // Convert "Won" to "win", "Lost" to "lost"
        date: new Date(history.createdAt).toLocaleDateString()
    }));
    
    return {
        totalGames,
        wins,
        losses: totalGames - wins,
        winRate: `${winRate}%`,
        recentGames
    };
};

export const createPlayer = async (username, password) => {
    if ( password.length < 6 ) throw new Error('Password must be at least 6 character');
    const isExist = await Player.findOne({ where: { username }})
    if (isExist) throw new Error('Username is already taken');
    const hashedPassword = await bcrypt.hash(password, 10);
    const player = await Player.create({
        username,
        password: hashedPassword,
    })
    return player;
}

export const getPlayer = async (username, password) => {
    const player = await Player.findOne({ where: { username } });
    if (!player) throw new Error('Player not found');

    const isMatch = await bcrypt.compare(password, player.password);
    if (isMatch) return player;
    else throw new Error('Password not valid');
}

export const updatePlayer = async (newUsername, username) => {
    const isExist = await Player.findOne({ where: { username: newUsername }});
    if (isExist) throw new Error('Username is already taken');
    const guest = await Player.findOne({ where: { username, isGuest: true }});
    if (guest) throw new Error('Player is a guest');
    const player = await Player.findOne({ where: { username }});
    if (!player) throw new Error('Player not found');
    player.username = newUsername;
    await player.save();
    return player;
}

export const deletePlayer = async ( username ) => {
    const player = await Player.findOne({ where: { username }});
    if (!player) throw new Error('Player not found');
    await player.destroy();
    return player;
}

export const createGuest = async ( guestName ) => {
    const guest = await Player.create({
        username: guestName,
        password: null,
        isGuest: true,
    });
    return guest;
}

export const convertGuestToPlayer = async (guestName, username, password) => {
    if ( password.length < 6 ) throw new Error('Password must be at least 6 character');
    const player = await Player.findOne({ where: { username: guestName, isGuest: true }});
    if (!player) throw new Error('Guest not found');
    const isExist = await Player.findOne({ where: { username }});
    if (isExist && isExist.id !== player.id) throw new Error('Username is already taken');
    const hashedPassword = await bcrypt.hash(password, 10);
    player.username = username;
    player.password = hashedPassword;
    player.isGuest = false;
    await player.save();
    return player;
}