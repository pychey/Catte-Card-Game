import jwt from 'jsonwebtoken';
import Player from '../models/player.model.js';

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access token required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const player = await Player.findByPk(decoded.playerId);

        if (!player) return res.status(403).json({ message: 'Invalid token' });
        
        req.player = player;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};