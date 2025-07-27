import express from "express";
import { createPlayer, getPlayer, updatePlayer, deletePlayer, createGuest, convertGuestToPlayer, verifyToken } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getPlayerHistory } from '../controllers/auth.controller.js';
const router = express.Router();


router.get('/history', authenticateToken, getPlayerHistory);
router.post('/register', createPlayer);
router.post('/login', getPlayer);
router.post('/guest', createGuest);
router.put('/update', authenticateToken, updatePlayer);
router.delete('/delete', authenticateToken, deletePlayer);
router.post('/convert', authenticateToken, convertGuestToPlayer);
router.get('/verify', authenticateToken, verifyToken);

export default router;