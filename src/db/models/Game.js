const mongoose = require("mongoose");
const gameSchema = require("../schemas/Game");
const gameModel = mongoose.model("games", gameSchema);
module.exports = gameModel;