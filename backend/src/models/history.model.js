import { DataTypes } from "sequelize";
import sequelize from '../utils/database.utils.js';

const History = sequelize.define('history', {
    result: DataTypes.STRING,
});

export default History;