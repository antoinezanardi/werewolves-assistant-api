const { isMongoId } = require("validator");
const Game = require("./Game");
const GameHistory = require("../db/models/GameHistory");
const { generateError, sendError } = require("../helpers/functions/Error");
const { checkRequestData } = require("../helpers/functions/Express");
const { turnPreNightActionsOrder, turnNightActionsOrder } = require("../helpers/constants/Game");

exports.find = (search, projection, options = {}) => GameHistory.find(search, projection, options);

exports.findOne = (search, projection, options = {}) => GameHistory.findOne(search, projection, options);

exports.fillPlayerTargets = (data, players) => {
    for (const target of data.play.targets) {
        if (typeof target.player === "string" && isMongoId(target.player)) {
            target.player = players.find(({ _id }) => _id.toString() === target.player);
        }
    }
};

exports.fillPlayerVotes = (data, players) => {
    data.play.votes = data.play.votes.map(vote => {
        if (typeof vote.from === "string" && isMongoId(vote.from)) {
            vote.from = players.find(({ _id }) => _id.toString() === vote.from);
        }
        if (typeof vote.for === "string" && isMongoId(vote.from)) {
            vote.for = players.find(({ _id }) => _id.toString() === vote.for);
        }
        return vote;
    });
};

exports.fillPlayers = (data, players) => {
    if (data.play) {
        if (data.play.votes) {
            this.fillPlayerVotes(data, players);
        }
        if (data.play.targets) {
            this.fillPlayerTargets(data, players);
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

exports.isLifePotionUsed = async gameId => !!await this.findOne({ gameId, "play.targets.potion.life": true });

exports.isDeathPotionUsed = async gameId => !!await this.findOne({ gameId, "play.targets.potion.death": true });

exports.isInfectionUsed = async gameId => !!await this.findOne({ gameId, "play.targets.isInfected": true });

exports.getLastNightPlay = gameId => {
    const nightPlayActions = [...turnPreNightActionsOrder, ...turnNightActionsOrder].map(({ action }) => action);
    return this.findOne({ gameId, "play.action": { $in: nightPlayActions } }, null, { sort: { createdAt: -1 } });
};

exports.getLastProtectedPlayer = async gameId => {
    const lastGuardPlay = await this.findOne({ gameId, "play.action": "protect" }, null, { sort: { createdAt: -1 } });
    return lastGuardPlay ? lastGuardPlay.play.targets[0].player : null;
};

exports.getLastVotePlay = gameId => this.findOne({ gameId, "play.action": "vote" }, null, { sort: { createdAt: -1 } });

exports.getLastSistersPlay = gameId => this.findOne({ gameId, "play.source.name": "two-sisters" }, null, { sort: { createdAt: -1 } });

exports.getLastBrothersPlay = gameId => this.findOne({ gameId, "play.source.name": "three-brothers" }, null, { sort: { createdAt: -1 } });

exports.getPreviousPlay = gameId => this.findOne({ gameId }, null, { sort: { createdAt: -1 } });

exports.getFindSearch = query => {
    const search = {};
    const searchFields = {
        "play-action": "play.action",
        "play-source": "play.source.name",
    };
    for (const parameter in query) {
        if (query[parameter] !== undefined) {
            const value = query[parameter];
            const searchField = searchFields[parameter] ? searchFields[parameter] : parameter;
            search[searchField] = value;
        }
    }
    return search;
};

exports.getGameHistory = async(req, res) => {
    try {
        const { params, query } = checkRequestData(req);
        if (req.user.strategy === "JWT") {
            await Game.checkGameBelongsToUser(params.id, req.user._id);
        }
        const game = await Game.findOne({ _id: params.id });
        if (!game) {
            throw generateError("NOT_FOUND", `Game not found with id "${params.id}"`);
        }
        const search = this.getFindSearch(query, req);
        const gameHistory = await this.find({ gameId: params.id, ...search });
        res.status(200).json(gameHistory);
    } catch (e) {
        sendError(res, e);
    }
};