const mongoose = require("mongoose");
const gameHistorySchema = require("../schemas/GameHistory");
const gameHistoryModel = mongoose.model("gameHistory", gameHistorySchema);
module.exports = gameHistoryModel;