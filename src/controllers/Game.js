const { flatten } = require("mongo-dot-notation");
const Game = require("../db/models/Game");
const Role = require("../controllers/Role");
const { generateError, sendError } = require("../helpers/Error");
const { checkRouteParameters } = require("../helpers/Express");

exports.create = async(data, options = {}) => {
    const { lean } = options;
    if (!Array.isArray(data)) {
        options = null;
    }
    const game = await Game.create(data, options);
    return lean ? game.toObject() : game;
};

exports.find = async(search, projection, options = {}) => await Game.find(search, projection, options);

exports.findOne = async(search, projection, options = {}) => await Game.findOne(search, projection, options);

exports.findOneAndUpdate = async(search, data, options = {}) => {
    options.new = options.new === undefined ? true : options.new;
    const game = await this.findOne(search);
    if (!game) {
        throw generateError("NOT_FOUND", `Game not found`);
    }
    return await Game.findOneAndUpdate(search, flatten(data), options);
};

exports.getGames = async(req, res) => {
    try {
        checkRouteParameters(req);
        const games = await this.find({});
        res.status(200).json(games);
    } catch (e) {
        sendError(res, e);
    }
};

exports.getVillagerRoles = async(players, wolfRoles) => {
    const villagerRoles = [];
    const villagerCount = players.length - wolfRoles.length;
    const availablePowerfulVillagerRoles = await Role.find({ group: "villagers", name: { $not: /villager/ } });
    const villagerRole = await Role.findOne({ name: "villager" });
    for (let i = 0; i < villagerCount; i++) {
        const idx = Math.floor(Math.random() * availablePowerfulVillagerRoles.length);
        villagerRoles.push(JSON.parse(JSON.stringify(availablePowerfulVillagerRoles[idx])));
        availablePowerfulVillagerRoles[idx].maxInGame--;
        if (!availablePowerfulVillagerRoles[idx].maxInGame) {
            availablePowerfulVillagerRoles.splice(idx, 1);
        }
    }
    return villagerRoles;
};

exports.getWolfCount = players => {
    let wolfCount;
    if (players.length < 12) {
        wolfCount = 2;
    } else if (players.length < 17) {
        wolfCount = 3;
    } else {
        wolfCount = 4;
    }
    return wolfCount;
};

exports.getWolfRoles = async players => {
    const wolfRoles = [];
    const wolfCount = this.getWolfCount(players);
    const availableWolfRoles = await Role.find({ group: "wolves" });
    for (let i = 0; i < wolfCount; i++) {
        const idx = Math.floor(Math.random() * availableWolfRoles.length);
        wolfRoles.push(JSON.parse(JSON.stringify(availableWolfRoles[idx])));
        availableWolfRoles[idx].maxInGame--;
        if (!availableWolfRoles[idx].maxInGame) {
            availableWolfRoles.splice(idx, 1);
        }
    }
    return wolfRoles;
};

exports.getGameRepartition = async(req, res) => {
    try {
        const { body } = checkRouteParameters(req);
        const wolfRoles = await this.getWolfRoles(body.players);
        const villagerRoles = await this.getVillagerRoles(body.players, wolfRoles);
        res.status(200).json(villagerRoles);
    } catch (e) {
        sendError(res, e);
    }
};

exports.getGame = async(req, res) => {
    try {
        const { params } = checkRouteParameters(req);
        const game = await this.findOne({ _id: params.id });
        if (!game) {
            throw generateError("NOT_FOUND", `Game not found with id "${params.id}"`);
        }
        res.status(200).json(game);
    } catch (e) {
        sendError(res, e);
    }
};