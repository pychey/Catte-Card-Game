import * as authService from '../services/auth.service.js';
import { faker } from '@faker-js/faker';

export const createPlayer = async (req,res) => {
    const { username, password } = req.body;
    if ( !username || !password ) return res.status(400).json({ message: 'Username and password are required' });

    try {
        const playerCreated = await authService.createPlayer(username, password);
        res.status(201).json({ data: playerCreated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getPlayer = async (req,res) => {
    const { username, password } = req.body;
    if ( !username || !password ) return res.status(400).json({ message: 'Username and password are required' });
    
    try {
        const player = await authService.getPlayer(username, password);
        res.status(200).json({ data: player });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updatePlayer = async (req, res) => {
    const { username, newUsername } = req.body;
    if ( !username || !newUsername ) return res.status(400).json({ message: 'Current username and updated username are required' });

    try {
        const updatedPlayer = await authService.updatePlayer(newUsername, username);
        res.status(200).json({ data: updatedPlayer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePlayer = async (req, res) => {
    const { username } = req.body;
    if ( !username ) return res.status(400).json({ message: 'Username is required' });

    try {
        const deletedPlayer = await authService.deletePlayer(username);
        res.status(200).json({ data: deletedPlayer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createGuest = async (req, res) => {
    const guestName = `Guest_${faker.internet.username()}${faker.string.alphanumeric({ length: 8 })}`;

    try {
        const guest = await authService.createGuest(guestName);
        res.status(201).json({ data: guest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const convertGuestToPlayer = async (req, res) => {
    const { guestName, username, password } = req.body;
    if ( !guestName || !username || !password ) return res.status(400).json({ message: 'Username and password are required' });
    
    try {
        const convertedPlayer = await authService.convertGuestToPlayer(guestName, username, password);
        res.status(200).json({ data: convertedPlayer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}