import express from "express";
import { createPlayer, getPlayer, updatePlayer, deletePlayer, createGuest, convertGuestToPlayer, verifyToken } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', createPlayer);
router.post('/login', getPlayer);
router.post('/guest', createGuest);
router.put('/update', authenticateToken, updatePlayer);
router.delete('/delete', authenticateToken, deletePlayer);
router.post('/convert', authenticateToken, convertGuestToPlayer);
router.get('/verify', authenticateToken, verifyToken);

export default router;