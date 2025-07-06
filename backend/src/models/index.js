import Player from "./player.js";
import History from "./history.js";

Player.belongsToMany(History, { through: 'game_participant' });
History.belongsToMany(Player, { through: 'game_participant' });