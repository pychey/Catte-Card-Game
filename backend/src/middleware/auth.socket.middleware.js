import { verifyToken } from '../utils/jwt.utils.js';
import Player from '../models/player.model.js';

export const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) return next(new Error('Authentication Error'));

        const decoded = verifyToken(token);
        const player = await Player.findByPk(decoded.playerId);
        
        if (!player) return next(new Error('Invalid token'));

        socket.data.player = player;
        socket.data.playerName = player.username;
        next();
    } catch (error) {
        next(new Error('Authentication Error'));
    }
};