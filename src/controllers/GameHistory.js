const { isMongoId } = require("validator");
const Game = require("./Game");
const GameHistory = require("../db/models/GameHistory");
const { generateError } = require("../helpers/functions/Error");
const { turnPreNightActionsOrder, turnNightActionsOrder } = require("../helpers/constants/Game");

exports.find = async(search, projection, options = {}) => await GameHistory.find(search, projection, options);

exports.findOne = async(search, projection, options = {}) => await GameHistory.findOne(search, projection, options);

exports.fillPlayers = (data, players) => {
    if (data.play) {
        if (data.play.votes) {
            for (const vote of data.play.votes) {
                vote.from = typeof vote.from === "string" && isMongoId(vote.from) ? players.find(({ _id }) => _id.toString() === vote.from) : vote.from;
                vote.for = typeof vote.for === "string" && isMongoId(vote.from) ? players.find(({ _id }) => _id.toString() === vote.for) : vote.for;
            }
        }
        if (data.play.targets) {
            for (const target of data.play.targets) {
                target.player = typeof target.player === "string" && isMongoId(target.player) ? players.find(({ _id }) => _id.toString() === target.player) : target.player;
            }
        }
    }
};

exports.checkAndFillDataBeforeCreate = async data => {
    const game = await Game.findOne({ _id: data.gameId });
    if (!game) {
        throw generateError("NOT_FOUND", `Game with ID ${data.gameId} not found for game history entry creation.`);
    }
    if (!data.play.votes || !data.play.votes.length) {
        delete data.play.votes;
    }
    if (!data.play.targets || !data.play.targets.length) {
        delete data.play.targets;
    }
    this.fillPlayers(data, game.players);
};

exports.create = async(data, options = {}) => {
    const { toJSON } = options;
    delete options.toJSON;
    if (!Array.isArray(data)) {
        options = null;
    }
    await this.checkAndFillDataBeforeCreate(data);
    const gameHistoryEntry = await GameHistory.create(data, options);
    return toJSON ? gameHistoryEntry.toJSON() : gameHistoryEntry;
};

exports.deleteMany = search => GameHistory.deleteMany(search);

exports.isLifePotionUsed = async gameId => await this.findOne({ gameId, "play.targets.potion.life": true });

exports.isDeathPotionUsed = async gameId => await this.findOne({ gameId, "play.targets.potion.death": true });

exports.getLastNightPlay = async gameId => {
    const nightPlayActions = [...turnPreNightActionsOrder, ...turnNightActionsOrder].map(({ action }) => action);
    return await this.findOne({ gameId, "play.action": { $in: nightPlayActions } }, null, { sort: { createdAt: -1 } });
};

exports.getLastProtectedPlayer = async gameId => {
    const lastProtectorPlay = await this.findOne({ gameId, "play.action": "protect" }, null, { sort: { createdAt: -1 } });
    return lastProtectorPlay ? lastProtectorPlay.play.targets[0].player : null;
};

exports.getLastVotePlay = async gameId => await this.findOne({ gameId, "play.action": "vote" }, null, { sort: { createdAt: -1 } });