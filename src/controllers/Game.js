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

exports.assignRoleToPlayers = (players, roles) => {
    for (let i = 0; i < players.length; i++) {
        const roleIdx = Math.floor(Math.random() * roles.length);
        players[i].role = roles[roleIdx].name;
        roles.splice(roleIdx, 1);
    }
    return players;
};

exports.getVillagerRoles = async(players, wolfRoles) => {
    const villagerRoles = [];
    const villagerCount = players.length - wolfRoles.length;
    const availablePowerfulVillagerRoles = await Role.find({ group: "villagers", name: { $not: /villager/ } });
    const villagerRole = await Role.findOne({ name: "villager" });
    for (let i = 0; i < villagerCount; i++) {
        if (!availablePowerfulVillagerRoles.length) {
            villagerRoles.push(JSON.parse(JSON.stringify(villagerRole)));
            villagerRole.maxInGame--;
        } else {
            villagerRoles.push(this.pickRandomRole(availablePowerfulVillagerRoles));
        }
    }
    return villagerRoles;
};

exports.pickRandomRole = roles => {
    const idx = Math.floor(Math.random() * roles.length);
    const role = JSON.parse(JSON.stringify(roles[idx]));
    roles[idx].maxInGame--;
    if (!roles[idx].maxInGame) {
        roles.splice(idx, 1);
    }
    delete role._id;
    delete role.maxInGame;
    return role;
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
        wolfRoles.push(this.pickRandomRole(availableWolfRoles));
    }
    return wolfRoles;
};

exports.checkUniqueNameInPlayers = players => {
    const playerSet = [...new Set(players.map(player => player.name))];
    if (playerSet.length !== players.length) {
        throw generateError("PLAYERS_NAME_NOT_UNIQUE", "Players don't all have unique name.");
    }
};

exports.getGameRepartition = async(req, res) => {
    try {
        const { body } = checkRouteParameters(req);
        this.checkUniqueNameInPlayers(body.players);
        const wolfRoles = await this.getWolfRoles(body.players);
        const villagerRoles = await this.getVillagerRoles(body.players, wolfRoles);
        this.assignRoleToPlayers(body.players, [...villagerRoles, ...wolfRoles]);
        res.status(200).json(body.players);
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

exports.checkRolesCompatibility = players => {
    if (!players.filter(player => player.role.group === "wolves").length) {
        throw generateError("NO_WOLF_IN_GAME_COMPOSITION", "No player has the `wolf` role in game composition.");
    } else if (!players.filter(player => player.role.group === "villagers").length) {
        throw generateError("NO_VILLAGER_IN_GAME_COMPOSITION", "No player has the `villager` role in game composition.");
    }
};

exports.fillPlayersData = async players => {
    const roles = await Role.find();
    for (const player of players) {
        const role = roles.find(role => role.name === player.role);
        player.role = { original: role.name, current: role.name, group: role.group };
    }
};

exports.checkAndFillDataBeforeCreate = async data => {
    this.checkUniqueNameInPlayers(data.players);
    await this.fillPlayersData(data.players);
    this.checkRolesCompatibility(data.players);
};

exports.postGame = async(req, res) => {
    try {
        const { body } = checkRouteParameters(req);
        await this.checkAndFillDataBeforeCreate(body);
        res.status(200).json(body);
    } catch (e) {
        sendError(res, e);
    }
};