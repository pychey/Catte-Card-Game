import { DataTypes } from "sequelize";
import sequelize from '../utils/database.js';

const Player = sequelize.define('player', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
    },
    rank: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    isGuest: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
});

export default Player;