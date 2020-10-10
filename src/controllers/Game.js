const mongoose = require("mongoose");
const { flatten } = require("mongo-dot-notation");
const Game = require("../db/models/Game");
const Player = require("./Player");
const GameHistory = require("./GameHistory");
const { generateError, sendError } = require("../helpers/functions/Error");
const { checkRequestData } = require("../helpers/functions/Express");
const { isVillagerSideAlive, isWerewolfSideAlive } = require("../helpers/functions/Game");
const { populate, turnPreNightActionsOrder, turnNightActionsOrder } = require("../helpers/constants/Game");
const { groupNames } = require("../helpers/constants/Role");
const { getPlayerRoles } = require("../helpers/functions/Role");
const { filterOutHTMLTags } = require("../helpers/functions/String");

exports.find = async(search, projection, options = {}) => {
    let games = await Game.find(search, projection, options).populate(populate);
    if (options.toJSON) {
        games = games.map(game => game.toJSON());
    }
    return games;
};

exports.findOne = async(search, projection, options = {}) => {
    let game = await Game.findOne(search, projection, options).populate(populate);
    if (game && options.toJSON) {
        game = game.toJSON();
    }
    return game;
};

exports.fillFirstWaiting = data => {
    const firstWaiting = { for: "all", to: "elect-sheriff" };
    data.waiting = [firstWaiting];
};

exports.checkUserCurrentGames = async userId => {
    if (await Game.countDocuments({ gameMaster: userId, status: "playing" })) {
        throw generateError("GAME_MASTER_HAS_ON_GOING_GAMES", "The game master has already game with status `playing`.");
    }
};

exports.checkRolesCompatibility = players => {
    if (!players.filter(player => player.role.group === "werewolves").length) {
        throw generateError("NO_WEREWOLF_IN_GAME_COMPOSITION", "No player has the `werewolf` role in game composition.");
    } else if (!players.filter(player => player.role.group === "villagers").length) {
        throw generateError("NO_VILLAGER_IN_GAME_COMPOSITION", "No player has the `villager` role in game composition.");
    }
};

exports.fillPlayersData = players => {
    for (const player of players) {
        player.name = filterOutHTMLTags(player.name);
        const role = getPlayerRoles().find(playerRole => playerRole.name === player.role);
        player.role = { original: role.name, current: role.name, group: role.group };
    }
};

exports.checkUniqueNameInPlayers = players => {
    const playerSet = [...new Set(players.map(player => player.name))];
    if (playerSet.length !== players.length) {
        throw generateError("PLAYERS_NAME_NOT_UNIQUE", "Players don't all have unique name.");
    }
};

exports.checkAndFillDataBeforeCreate = async data => {
    this.checkUniqueNameInPlayers(data.players);
    this.fillPlayersData(data.players);
    this.checkRolesCompatibility(data.players);
    await this.checkUserCurrentGames(data.gameMaster);
    this.fillFirstWaiting(data);
};

exports.create = async(data, options = {}) => {
    const { toJSON } = options;
    delete options.toJSON;
    if (!Array.isArray(data)) {
        options = null;
    }
    await this.checkAndFillDataBeforeCreate(data);
    const game = await Game.create(data, options);
    await game.populate(populate).execPopulate();
    return toJSON ? game.toJSON() : game;
};

exports.checkDataBeforeUpdate = (game, data) => {
    if (!game) {
        throw generateError("NOT_FOUND", `Game not found`);
    } else if (data.review) {
        if (data.review.rating === undefined) {
            throw generateError("BAD_REQUEST", `Rating is mandatory for posting a game review.`);
        } else if (game.status !== "done" && game.status !== "canceled") {
            throw generateError("BAD_REQUEST", `Game needs to be done or canceled to have a review.`);
        }
    }
};

exports.findOneAndUpdate = async(search, data, options = {}) => {
    const { toJSON } = options;
    delete options.toJSON;
    options.new = options.new === undefined ? true : options.new;
    const game = await this.findOne(search);
    this.checkDataBeforeUpdate(game, data);
    const updatedGame = await Game.findOneAndUpdate(search, flatten(data), options);
    await updatedGame.populate(populate).execPopulate();
    return toJSON ? updatedGame.toJSON() : updatedGame;
};

exports.getGames = async(req, res) => {
    try {
        const search = {};
        const { query } = checkRequestData(req);
        if (req.user.strategy === "JWT") {
            search.gameMaster = req.user._id;
        }
        const games = await this.find({ ...search, ...query });
        res.status(200).json(games);
    } catch (e) {
        sendError(res, e);
    }
};

exports.assignRoleToPlayers = (players, roles) => {
    for (let i = 0; i < players.length; i++) {
        const roleIdx = Math.floor(Math.random() * roles.length);
        players[i].role = roles[roleIdx].name;
        players[i].group = roles[roleIdx].group;
        roles.splice(roleIdx, 1);
    }
    return players;
};

exports.getVillagerRoles = async(players, werewolfRoles) => {
    const villagerRoles = [];
    const villagerCount = players.length - werewolfRoles.length;
    const availablePowerfulVillagerRoles = await getPlayerRoles().filter(role => role.group === "villagers" && role.name !== "villager");
    const villagerRole = await getPlayerRoles().find(role => role.name === "villager");
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
    return role;
};

exports.getWerewolfCount = players => {
    let werewolfCount;
    if (players.length < 5) {
        werewolfCount = 1;
    } else if (players.length < 12) {
        werewolfCount = 2;
    } else if (players.length < 17) {
        werewolfCount = 3;
    } else {
        werewolfCount = 4;
    }
    return werewolfCount;
};

exports.getWerewolfRoles = players => {
    const werewolfRoles = [];
    const werewolfCount = this.getWerewolfCount(players);
    const availableWerewolfRoles = getPlayerRoles().filter(role => role.group === "werewolves");
    for (let i = 0; i < werewolfCount; i++) {
        werewolfRoles.push(this.pickRandomRole(availableWerewolfRoles));
    }
    return werewolfRoles;
};

exports.getGameRepartition = async(req, res) => {
    try {
        const { query } = checkRequestData(req);
        this.checkUniqueNameInPlayers(query.players);
        const werewolfRoles = await this.getWerewolfRoles(query.players);
        const villagerRoles = await this.getVillagerRoles(query.players, werewolfRoles);
        this.assignRoleToPlayers(query.players, [...villagerRoles, ...werewolfRoles]);
        res.status(200).json({ players: query.players });
    } catch (e) {
        sendError(res, e);
    }
};

exports.getGame = async(req, res) => {
    try {
        const { params } = checkRequestData(req);
        if (req.user.strategy === "JWT") {
            await this.checkGameBelongsToUser(params.id, req.user._id);
        }
        const game = await this.findOne({ _id: params.id });
        if (!game) {
            throw generateError("NOT_FOUND", `Game not found with id "${params.id}"`);
        }
        res.status(200).json(game);
    } catch (e) {
        sendError(res, e);
    }
};

exports.postGame = async(req, res) => {
    try {
        const { body } = checkRequestData(req);
        const game = await this.create({
            gameMaster: new mongoose.Types.ObjectId(req.user._id),
            players: body.players,
        });
        res.status(200).json(game);
    } catch (e) {
        sendError(res, e);
    }
};

exports.checkGameBelongsToUser = async(gameId, userId) => {
    const game = await this.findOne({ _id: gameId, gameMaster: { _id: userId } });
    if (!game) {
        throw generateError("GAME_DOESNT_BELONG_TO_USER", `Game with id ${gameId} doesn't belong to user with id ${userId}`);
    }
    return game;
};

exports.patchGame = async(req, res) => {
    try {
        const { params, body } = checkRequestData(req);
        await this.checkGameBelongsToUser(params.id, req.user._id);
        const game = await this.findOneAndUpdate({ _id: params.id }, body);
        res.status(200).json(game);
    } catch (e) {
        sendError(res, e);
    }
};

exports.checkGameWinners = game => {
    if (!isVillagerSideAlive(game) || !isWerewolfSideAlive(game)) {
        if (!isVillagerSideAlive(game)) {
            game.won = {
                by: "werewolves",
                players: game.players.filter(player => player.role.group === "werewolves"),
            };
        } else if (!isWerewolfSideAlive(game)) {
            game.won = {
                by: "villagers",
                players: game.players.filter(player => player.role.group === "villagers"),
            };
        }
        game.status = "done";
    }
};

exports.dequeueWaiting = game => {
    if (game.waiting && game.waiting.length) {
        game.waiting.shift();
    }
};

exports.isDayOver = async game => {
    const lastVotePlay = await GameHistory.getLastVotePlay(game._id);
    return !!(lastVotePlay && lastVotePlay.turn === game.turn);
};

exports.purgeAttributesAfterSunRising = game => {
    const purgedAttributes = ["protected", "seen", "drank-life-potion"];
    for (const purgedAttribute of purgedAttributes) {
        Player.removeAttributeFromAllPlayers(purgedAttribute, game);
    }
};

exports.fillWaitingQueueWithDayActions = async game => {
    const playerAttributeMethods = [
        { attribute: "eaten", trigger: Player.eaten },
        { attribute: "drank-death-potion", trigger: Player.drankDeathPotion },
    ];
    for (const { attribute, trigger } of playerAttributeMethods) {
        if (Player.getPlayersWithAttribute(attribute, game).length) {
            trigger(game);
        }
    }
    this.purgeAttributesAfterSunRising(game);
    if (!await this.isDayOver(game)) {
        game.waiting.push({ for: "all", to: "vote" });
    }
};

exports.isSourceAvailableInPlayers = (players, source) => {
    if (source === "all" || source === "sheriff") {
        return true;
    }
    const sourceType = groupNames.includes(source) ? "group" : "role";
    for (const player of players) {
        if (sourceType === "group" && player.role.group === source && player.isAlive ||
            sourceType === "role" && player.role.current === source && player.isAlive) {
            return true;
        }
    }
    return false;
};

exports.fillWaitingQueueWithNightActions = async(game, endOfDay = false) => {
    const actionsOrder = game.turn === 1 ? [...turnPreNightActionsOrder, ...turnNightActionsOrder] : [...turnNightActionsOrder];
    if (endOfDay) {
        for (let i = 0; i < actionsOrder.length; i++) {
            if (this.isSourceAvailableInPlayers(game.players, actionsOrder[i].source)) {
                const nextGameNightAction = actionsOrder[i];
                return game.waiting.push({ for: nextGameNightAction.source, to: nextGameNightAction.action });
            }
        }
    } else {
        let actionFound = false;
        const lastNightPlay = await GameHistory.getLastNightPlay(game._id);
        for (let i = 0; i < actionsOrder.length; i++) {
            if (lastNightPlay && lastNightPlay.play.source === actionsOrder[i].source && lastNightPlay.play.action === actionsOrder[i].action) {
                actionFound = true;
            } else if (actionFound && this.isSourceAvailableInPlayers(game.players, actionsOrder[i].source)) {
                const nextGameNightAction = actionsOrder[i];
                return game.waiting.push({ for: nextGameNightAction.source, to: nextGameNightAction.action });
            }
        }
    }
};

exports.fillWaitingQueue = async game => {
    if (game.phase === "night") {
        await this.fillWaitingQueueWithNightActions(game);
        if (!game.waiting || !game.waiting.length) {
            game.phase = "day";
            return this.fillWaitingQueueWithDayActions(game);
        }
    } else if (game.phase === "day") {
        await this.fillWaitingQueueWithDayActions(game);
        if (!game.waiting || !game.waiting.length) {
            game.phase = "night";
            game.turn++;
            return this.fillWaitingQueueWithNightActions(game, true);
        }
    }
};

exports.generatePlayMethods = () => ({
    all: Player.allPlay,
    seer: Player.seerPlays,
    witch: Player.witchPlays,
    guard: Player.guardPlays,
    raven: Player.ravenPlays,
    hunter: Player.hunterPlays,
    werewolves: Player.werewolvesPlay,
    sheriff: Player.sheriffPlays,
});

exports.generateGameHistoryEntry = (game, play) => ({
    gameId: game._id,
    turn: game.turn,
    phase: game.phase,
    tick: game.tick,
    play,
});

exports.checkPlay = async play => {
    const game = await this.findOne({ _id: play.gameId });
    if (!game) {
        throw generateError("NOT_FOUND", `Game with id ${play.gameId} not found`);
    } else if (game.status !== "playing") {
        throw generateError("NO_MORE_PLAY_ALLOWED", `Game with id "${play.gameId}" is not playing but with status "${game.status}"`);
    } else if (game.waiting[0].for !== play.source) {
        throw generateError("BAD_PLAY_SOURCE", `Game is waiting for "${game.waiting.for}", not "${play.source}"`);
    } else if (game.waiting[0].to !== play.action) {
        throw generateError("BAD_PLAY_ACTION", `Game is waiting for "${game.waiting.for}" to "${game.waiting.to}", not "${play.action}"`);
    }
};

exports.play = async play => {
    await this.checkPlay(play);
    const game = await this.findOne({ _id: play.gameId }, "-gameMaster", { toJSON: true });
    const gameHistoryEntry = this.generateGameHistoryEntry(game, play);
    const playMethods = this.generatePlayMethods();
    await playMethods[play.source](play, game, gameHistoryEntry);
    await GameHistory.create(gameHistoryEntry);
    this.dequeueWaiting(game);
    if (!game.waiting || !game.waiting.length) {
        await this.fillWaitingQueue(game);
    }
    game.tick++;
    this.checkGameWinners(game);
    return this.findOneAndUpdate({ _id: play.gameId }, game);
};

exports.postPlay = async(req, res) => {
    try {
        const { params, body } = checkRequestData(req);
        await this.checkGameBelongsToUser(params.id, req.user._id);
        const game = await this.play({ ...body, gameId: params.id });
        res.status(200).json(game);
    } catch (e) {
        sendError(res, e);
    }
};

exports.checkGameBeforeReset = async gameId => {
    const game = await this.findOne({ _id: gameId });
    if (!game) {
        throw generateError("NOT_FOUND", `Game with id "${gameId}" not found.`);
    } else if (game.status === "canceled" || game.status === "done") {
        throw generateError("CANT_BE_RESET", `Game with id "${gameId}" can't be reset because its status is "${game.status}".`);
    }
};

exports.resetGame = async(req, res) => {
    try {
        const { params } = checkRequestData(req);
        await this.checkGameBelongsToUser(params.id, req.user._id);
        await this.checkGameBeforeReset(params.id);
        await GameHistory.deleteMany({ gameId: params.id });
        let game = await this.findOne({ _id: params.id });
        const players = game.players.map(player => ({ name: player.name, role: player.role.original }));
        await this.fillPlayersData(players);
        game = await this.findOneAndUpdate({ _id: params.id }, {
            players,
            turn: 1,
            phase: "night",
            tick: 1,
            waiting: [{ for: "all", to: "elect-sheriff" }],
        });
        res.status(200).json(game);
    } catch (e) {
        sendError(res, e);
    }
};