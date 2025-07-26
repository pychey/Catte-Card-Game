import jwt from 'jsonwebtoken';

export const generateAccessToken = (player) => {
    return jwt.sign(
        { 
            playerId: player.id, 
            username: player.username,
            isGuest: player.isGuest 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};