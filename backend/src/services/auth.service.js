import bcrypt from 'bcrypt';
import Player from "../models/player.js";

export const createPlayer = async (username, password) => {
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
    const isExist = await Player.findOne({ where: { username }})
    if (isExist) throw new Error('Username is already taken');
    const hashedPassword = await bcrypt.hash(password, 10);
    const player = await Player.findOne({ where: { username: guestName, isGuest: true }});
    player.username = username;
    player.password = hashedPassword;
    player.isGuest = false;
    await player.save();
    return player;
}