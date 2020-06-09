const GameHistory = require("../db/models/GameHistory");

exports.find = async(search, projection, options = {}) => await GameHistory.find(search, projection, options);

exports.findOne = async(search, projection, options = {}) => await GameHistory.findOne(search, projection, options);

exports.create = async(data, options = {}) => {
    const { toJSON } = options;
    delete options.toJSON;
    if (!Array.isArray(data)) {
        options = null;
    }
    const gameHistoryEntry = await GameHistory.create(data, options);
    return toJSON ? gameHistoryEntry.toJSON() : gameHistoryEntry;
};

exports.isLifePotionUsed = async gameId => await this.findOne({ gameId, play: { targets: { potion: { life: true } } } });

exports.isDeathPotionUsed = async gameId => await this.findOne({ gameId, play: { targets: { potion: { death: true } } } });

exports.getLastProtectedPlayer = async gameId => {
    const lastProtectorPlay = await this.findOne({ gameId, play: { action: "protect" } }, null, { sort: { createdAt: -1 } });
    return lastProtectorPlay ? lastProtectorPlay.play.targets[0].player : null;
};