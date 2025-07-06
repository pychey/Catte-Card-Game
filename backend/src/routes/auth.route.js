import express from "express";
import { createPlayer, getPlayer, updatePlayer, deletePlayer, createGuest, convertGuestToPlayer } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', createPlayer);
router.post('/login', getPlayer);
router.put('/update', updatePlayer);
router.delete('/delete', deletePlayer);
router.post('/guest', createGuest);
router.post('/convert', convertGuestToPlayer);

export default router;