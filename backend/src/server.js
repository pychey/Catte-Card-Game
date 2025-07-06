import express from "express";
import sequelize from "./utils/database.js";
import dotenv from "dotenv";
import './models/index.js';
import authRouter from './routes/auth.route.js'
import { app, server } from "./utils/socket.js";

sequelize.sync();

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(express.json());

app.use('/auth', authRouter);

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});