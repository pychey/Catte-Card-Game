import express from "express";
import { createPlayer, getPlayer, updatePlayer, deletePlayer } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/create', createPlayer);
router.post('/login', getPlayer);
router.put('/update', updatePlayer);
router.delete('/delete', deletePlayer);

export default router;