const GameHistory = require("../db/models/GameHistory");

exports.find = async(search, projection, options = {}) => await GameHistory.find(search, projection, options);

exports.findOne = async(search, projection, options = {}) => await GameHistory.findOne(search, projection, options);