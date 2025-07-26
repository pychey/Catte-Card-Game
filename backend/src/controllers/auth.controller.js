import * as authService from '../services/auth.service.js';
import { generateAccessToken } from '../utils/jwt.utils.js';
import { faker } from '@faker-js/faker';

export const createPlayer = async (req,res) => {
    const { username, password } = req.body;
    if ( !username || !password ) return res.status(400).json({ message: 'Username and password are required' });

    try {
        const playerCreated = await authService.createPlayer(username, password);
        const token = generateAccessToken(playerCreated);

        res.status(201).json({ data: { token, player: { id: playerCreated.id, username: playerCreated.username, rank: playerCreated.rank, isGuest: playerCreated.isGuest }}});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getPlayer = async (req,res) => {
    const { username, password } = req.body;
    if ( !username || !password ) return res.status(400).json({ message: 'Username and password are required' });
    
    try {
        const player = await authService.getPlayer(username, password);
        const token = generateAccessToken(player);

        res.status(200).json({ data: { token, player: { id: player.id, username: player.username, rank: player.rank, isGuest: player.isGuest }}});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updatePlayer = async (req, res) => {
    const { newUsername } = req.body;
    const currentUsername = req.player.username;
    if (!newUsername) return res.status(400).json({ message: 'New username is required' });

    try {
        const updatedPlayer = await authService.updatePlayer(newUsername, currentUsername);
        const token = generateAccessToken(updatedPlayer);

        res.status(200).json({ data: { token, player: { id: updatedPlayer.id, username: updatedPlayer.username, rank: updatedPlayer.rank, isGuest: updatedPlayer.isGuest }}});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePlayer = async (req, res) => {
    const username = req.player.username;

    try {
        const deletedPlayer = await authService.deletePlayer(username);
        res.status(200).json({ data: { message: 'Player deleted successfully', player: { id: deletedPlayer.id, username: deletedPlayer.username, rank: deletedPlayer.rank, isGuest: deletedPlayer.isGuest }}});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createGuest = async (req, res) => {
    const guestName = `Guest_${faker.internet.username()}${faker.string.alphanumeric({ length: 8 })}`;

    try {
        const guest = await authService.createGuest(guestName);
        const token = generateAccessToken(guest);

        res.status(201).json({ data: { token, player: { id: guest.id, username: guest.username, rank: guest.rank, isGuest: guest.isGuest }}});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const convertGuestToPlayer = async (req, res) => {
    const { username, password } = req.body;
    const guestName = req.player.username;
    
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
    
    try {
        const convertedPlayer = await authService.convertGuestToPlayer(guestName, username, password);
        const token = generateAccessToken(convertedPlayer);
        
        res.status(200).json({ data: { token, player: { id: convertedPlayer.id, username: convertedPlayer.username, rank: convertedPlayer.rank, isGuest: convertedPlayer.isGuest }}});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const verifyToken = async (req, res) => {
    res.status(200).json({  data: { valid: true, player: { id: req.player.id, username: req.player.username, rank: req.player.rank, isGuest: req.player.isGuest }}});
};