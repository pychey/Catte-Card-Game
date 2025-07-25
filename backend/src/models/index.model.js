import Player from "./player.model.js";
import History from "./history.model.js";

Player.belongsToMany(History, { through: 'game_participant' });
History.belongsToMany(Player, { through: 'game_participant' });