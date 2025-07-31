import express from "express";
import cors from "cors";
import sequelize from "./utils/database.utils.js";
import dotenv from "dotenv";
import './models/index.model.js';
import authRouter from './routes/auth.route.js'
import { app, server } from "./utils/socket.utils.js";
import "./socket/index.socket.js";

sequelize.sync();

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});