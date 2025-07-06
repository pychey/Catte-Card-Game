import express from "express";
import sequelize from "./utils/database.js";
import './models/index.js';
import authRouter from './routes/auth.route.js'

sequelize.sync({ force: true });

const app = express();

app.use('/auth', authRouter);

app.listen(5001, () => {
    console.log(`Server running at http://localhost:5001`);
});