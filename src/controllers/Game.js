const mongoose = require("mongoose");
const deepMerge = require("deepmerge");
const { flatten } = require("mongo-dot-notation");
const Game = require("../db/models/Game");
const Player = require("./Player");
const GameHistory = require("./GameHistory");
const { generateError, sendError } = require("../helpers/functions/Error");
const { checkRequestData } = require("../helpers/functions/Express");
const {
    isVillagerSideAlive, isWerewolfSideAlive, areAllPlayersDead, getPlayersInLoversTeam, getPlayersWithRole, getGameTurnNightActionsOrder,
    areLoversTheOnlyAlive, isGameDone, getPlayerWithRole, getPlayersWithSide, getAlivePlayers, getPlayersExpectedToPlay,
    getFindFields, getPlayerWithAttribute, getDefaultGameOptions, isVotePossible, hasPiedPiperWon, isWhiteWerewolfOnlyAlive, hasAngelWon,
    getAdditionalCardsThiefRoleNames,
} = require("../helpers/functions/Game");
const { getPlayerAttribute, doesPlayerHaveAttribute, isPlayerAttributeActive } = require("../helpers/functions/Player");
const { getRoles, getGroupNames } = require("../helpers/functions/Role");
const { populate: fullGamePopulate } = require("../helpers/constants/Game");
const { getProp } = require("../helpers/functions/Object");
const { filterOutHTMLTags } = require("../helpers/functions/String");

exports.getFindPopulate = (projection, options) => {
    const populate = [];
    if (!projection || projection.includes("gameMaster")) {
        populate.push({ path: "gameMaster", select: "-password" });
    }
    if (!projection || projection.includes("history")) {
        const limit = options["history-limit"] !== undefined ? options["history-limit"] : 3;
        populate.push({ path: "history", options: { limit } });
    }
    return populate;
};

exports.find = async(search, projection, options = {}) => {
    const populate = this.getFindPopulate(projection, options);
    let games = await Game.find(search, projection).populate(populate);
    if (options.toJSON) {
        games = games.map(game => game.toJSON());
    }
    return games;
};

exports.findOne = async(search, projection, options = {}) => {
    const populate = this.getFindPopulate(projection, options);
    let game = await Game.findOne(search, projection).populate(populate);
    if (game && options.toJSON) {
        game = game.toJSON();
    }
    return game;
};

exports.checkUserCurrentGames = async userId => {
    if (await Game.countDocuments({ gameMaster: userId, status: "playing" })) {
        throw generateError("GAME_MASTER_HAS_ON_GOING_GAMES", "The game master has already game with status `playing`.");
    }
};

exports.fillOptionsData = game => {
    game.options = game.options ? deepMerge(getDefaultGameOptions(), game.options) : getDefaultGameOptions();
};

exports.fillTickData = game => {
    game.tick = 1;
    game.phase = "night";
    game.turn = 1;
};

exports.checkAdditionalCardsData = ({ players, additionalCards, options }) => {
    const { additionalCardsCount: thiefAdditionalCardsCount } = options.roles.thief;
    if (additionalCards && !getPlayerWithRole("thief", { players })) {
        throw generateError("ADDITIONAL_CARDS_NOT_ALLOWED", "`additionalCards` is not allowed when there is no `thief` in game.");
    } else if (!additionalCards && getPlayerWithRole("thief", { players })) {
        throw generateError("NEED_ADDITIONAL_CARDS_FOR_THIEF", `${thiefAdditionalCardsCount} additional cards are needed for thief.`);
    }
    if (additionalCards) {
        const additionalCardsThiefRoleNames = getAdditionalCardsThiefRoleNames();
        const roles = getRoles();
        const thiefAdditionalCards = additionalCards.filter(({ for: recipient }) => recipient === "thief");
        if (thiefAdditionalCards.length !== thiefAdditionalCardsCount) {
            throw generateError("THIEF_ADDITIONAL_CARDS_COUNT_NOT_RESPECTED", `Exactly ${thiefAdditionalCardsCount} additional cards are needed for thief.`);
        }
        for (const { role: additionalRole, for: recipient } of additionalCards) {
            if (recipient === "thief" && !additionalCardsThiefRoleNames.includes(additionalRole)) {
                throw generateError("FORBIDDEN_ADDITIONAL_CARD_ROLE_FOR_THIEF", `"${additionalRole}" is not allowed in additional cards for thief.`);
            }
            const playersWithRole = getPlayersWithRole(additionalRole, { players });
            const roleCount = playersWithRole.length + additionalCards.reduce((acc, card) => card.role === additionalRole ? acc + 1 : acc, 0);
            const role = roles.find(({ name }) => name === additionalRole);
            if (roleCount > role.maxInGame) {
                throw generateError("TOO_MUCH_PLAYERS_WITH_ROLE", `There are too many players (${roleCount}) with the role "${role.name}" which limit is ${role.maxInGame}, please check additional cards.`);
            }
        }
    }
};

exports.checkRolesCompatibility = players => {
    if (!getPlayersWithSide("werewolves", { players }).length) {
        throw generateError("NO_WEREWOLF_IN_GAME_COMPOSITION", "No player has the `werewolf` role in game composition.");
    } else if (!getPlayersWithSide("villagers", { players }).length) {
        throw generateError("NO_VILLAGER_IN_GAME_COMPOSITION", "No player has the `villager` role in game composition.");
    }
    const roles = getRoles();
    for (const role of roles) {
        const playersWithRole = getPlayersWithRole(role.name, { players });
        if (playersWithRole.length) {
            if (role.maxInGame && playersWithRole.length > role.maxInGame) {
                throw generateError("TOO_MUCH_PLAYERS_WITH_ROLE", `There are too many players (${playersWithRole.length}) with the role "${role.name}" which limit is ${role.maxInGame}`);
            } else if (role.minInGame && playersWithRole.length < role.minInGame) {
                throw generateError("MIN_PLAYERS_NOT_REACHED_FOR_ROLE", `There are too less players (${playersWithRole.length}) with the role "${role.name}" which minimum is ${role.minInGame}`);
            }
        }
    }
};

exports.fillPlayersData = players => {
    let position = 0;
    for (const player of players) {
        player.name = filterOutHTMLTags(player.name);
        const role = getRoles().find(playerRole => playerRole.name === player.role);
        player.role = { original: role.name, current: role.name };
        player.side = { original: role.side, current: role.side };
        if (role.name === "villager-villager") {
            player.role.isRevealed = true;
        }
        if (player.position === undefined) {
            player.position = position;
        }
        player.isAlive = true;
        position++;
    }
    players.sort((a, b) => a.position > b.position ? 1 : -1);
};

exports.checkPlayersPosition = players => {
    const isOnePlayerPositionNotSet = !!players.find(({ position }) => position === undefined);
    if (isOnePlayerPositionNotSet && !!players.find(({ position }) => position !== undefined)) {
        throw generateError("ALL_PLAYERS_POSITION_NOT_SET", `Some players has a position and other not. You must define all position or none of them.`);
    } else if (!isOnePlayerPositionNotSet) {
        const playerPositionSet = [...new Set(players.map(({ position }) => position))];
        const playerMaxPosition = players.length - 1;
        if (playerPositionSet.length !== players.length) {
            throw generateError("PLAYERS_POSITION_NOT_UNIQUE", "Players don't all have unique position.");
        } else if (players.some(({ position }) => position > playerMaxPosition)) {
            throw generateError("PLAYER_POSITION_TOO_HIGH", `One player's position exceeds the maximum (${playerMaxPosition}).`);
        }
    }
};

exports.checkUniqueNameInPlayers = players => {
    const playerNameSet = [...new Set(players.map(({ name }) => name))];
    if (playerNameSet.length !== players.length) {
        throw generateError("PLAYERS_NAME_NOT_UNIQUE", "Players don't all have unique name.");
    }
};

exports.checkAndFillDataBeforeCreate = async data => {
    await this.checkUserCurrentGames(data.gameMaster);
    this.checkUniqueNameInPlayers(data.players);
    this.checkPlayersPosition(data.players);
    this.fillPlayersData(data.players);
    this.checkRolesCompatibility(data.players);
    this.fillOptionsData(data);
    this.checkAdditionalCardsData(data);
    this.fillTickData(data);
    data.waiting = await this.getWaitingQueueWithNightActions(data);
};

exports.create = async(data, options = {}) => {
    const { toJSON } = options;
    delete options.toJSON;
    if (!Array.isArray(data)) {
        options = null;
    }
    await this.checkAndFillDataBeforeCreate(data);
    const game = await Game.create(data, options);
    await game.populate(fullGamePopulate).execPopulate();
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
    await updatedGame.populate(fullGamePopulate).execPopulate();
    return toJSON ? updatedGame.toJSON() : updatedGame;
};

exports.getFindProjection = query => query.fields ? query.fields.split(",").map(field => field.trim()) : null;

exports.getFindSearch = (query, req) => {
    const search = {};
    if (req.user.strategy === "JWT") {
        search.gameMaster = req.user._id;
    }
    const findFields = getFindFields();
    for (const parameter in query) {
        if (query[parameter] !== undefined) {
            const value = query[parameter];
            if (findFields.includes(parameter)) {
                search[parameter] = value;
            }
        }
    }
    return search;
};

exports.getGames = async(req, res) => {
    try {
        const { query } = checkRequestData(req);
        const search = this.getFindSearch(query, req);
        const projection = this.getFindProjection(query);
        const games = await this.find(search, projection, query);
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

exports.getAvailableRolesToPick = (roles, players, leftToPick, side, options) => roles.filter(role => role.side === side &&
    !options["forbidden-roles"].includes(role.name) &&
    (!options["are-powerful-villager-roles-prioritized"] || role.name !== "villager") &&
    (!options["are-powerful-werewolf-roles-prioritized"] || role.name !== "werewolf") &&
    (!role.recommendedMinPlayers || !options["are-recommended-min-players-respected"] || role.recommendedMinPlayers <= players.length) &&
    (!role.minInGame || role.minInGame <= leftToPick));

exports.getVillagerRoles = (players, werewolfRoles, options) => {
    const villagerRoles = [];
    const villagerCount = players.length - werewolfRoles.length;
    const villagerRole = getRoles().find(role => role.name === "villager");
    let availableVillagerRoles = getRoles();
    for (let i = 0; i < villagerCount; i++) {
        const leftToPick = villagerCount - i;
        availableVillagerRoles = this.getAvailableRolesToPick(availableVillagerRoles, players, leftToPick, "villagers", options);
        if (!availableVillagerRoles.length) {
            villagerRoles.push(JSON.parse(JSON.stringify(villagerRole)));
            villagerRole.maxInGame--;
        } else {
            const randomRole = this.pickRandomRole(availableVillagerRoles);
            if (randomRole.minInGame) {
                for (let j = 0; j < randomRole.minInGame; j++) {
                    villagerRoles.push(randomRole);
                }
                i += randomRole.minInGame - 1;
            } else {
                villagerRoles.push(randomRole);
            }
        }
    }
    return villagerRoles;
};

exports.pickRandomRole = roles => {
    const idx = Math.floor(Math.random() * roles.length);
    const role = JSON.parse(JSON.stringify(roles[idx]));
    roles[idx].maxInGame--;
    if (!roles[idx].maxInGame || roles[idx].minInGame) {
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
    } else if (players.length < 22) {
        werewolfCount = 4;
    } else if (players.length < 28) {
        werewolfCount = 5;
    } else {
        werewolfCount = 6;
    }
    return werewolfCount;
};

exports.getWerewolfRoles = (players, options) => {
    const werewolfRoles = [];
    const werewolfCount = this.getWerewolfCount(players);
    const werewolfRole = getRoles().find(role => role.name === "werewolf");
    let availableWerewolfRoles = getRoles();
    for (let i = 0; i < werewolfCount; i++) {
        const leftToPick = werewolfCount - i;
        availableWerewolfRoles = this.getAvailableRolesToPick(availableWerewolfRoles, players, leftToPick, "werewolves", options);
        if (!availableWerewolfRoles.length) {
            werewolfRoles.push(JSON.parse(JSON.stringify(werewolfRole)));
            werewolfRole.maxInGame--;
        } else {
            const randomRole = this.pickRandomRole(availableWerewolfRoles);
            werewolfRoles.push(randomRole);
        }
    }
    return werewolfRoles;
};

exports.getGameRepartition = (req, res) => {
    try {
        const { query } = checkRequestData(req);
        const { players, ...options } = query;
        this.checkUniqueNameInPlayers(players);
        const werewolfRoles = this.getWerewolfRoles(players, options);
        const villagerRoles = this.getVillagerRoles(players, werewolfRoles, options);
        this.assignRoleToPlayers(players, [...villagerRoles, ...werewolfRoles]);
        res.status(200).json({ players });
    } catch (e) {
        sendError(res, e);
    }
};

exports.getGame = async(req, res) => {
    try {
        const { params, query } = checkRequestData(req);
        if (req.user.strategy === "JWT") {
            await this.checkGameBelongsToUser(params.id, req.user._id);
        }
        const game = await this.findOne({ _id: params.id }, null, query);
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
            ...body,
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
    if (isGameDone(game)) {
        if (areAllPlayersDead(game)) {
            game.won = { by: null };
        } else if (hasAngelWon(game)) {
            game.won = { by: "angel", players: getPlayersWithRole("angel", game) };
        } else if (areLoversTheOnlyAlive(game)) {
            game.won = { by: "lovers", players: getPlayersInLoversTeam(game) };
        } else if (hasPiedPiperWon(game)) {
            game.won = { by: "pied-piper", players: getPlayersWithRole("pied-piper", game) };
        } else if (isWhiteWerewolfOnlyAlive(game)) {
            game.won = { by: "white-werewolf", players: getPlayersWithRole("white-werewolf", game) };
        } else if (!isVillagerSideAlive(game)) {
            game.won = { by: "werewolves", players: getPlayersWithSide("werewolves", game) };
        } else if (!isWerewolfSideAlive(game)) {
            game.won = { by: "villagers", players: getPlayersWithSide("villagers", game) };
        }
        game.status = "done";
    }
};

exports.refreshNightWaitingQueue = async game => {
    const { waiting: currentWaitingQueue } = game;
    const [currentPlay, ...rest] = currentWaitingQueue;
    const fullWaitingQueue = await this.getWaitingQueueWithNightActions(game);
    const preservedActions = ["shoot", "ban-voting", "delegate", "settle-votes"];
    const newWaitingQueue = [currentPlay, ...rest.filter(({ to: action }) => preservedActions.includes(action))];
    for (const waiting of fullWaitingQueue) {
        const gameHistorySearch = {
            "gameId": game._id, "turn": game.turn, "phase": "night",
            "play.source.name": waiting.for, "play.action": waiting.to,
        };
        if (currentPlay.for !== waiting.for && currentPlay.to !== waiting.to && !await GameHistory.findOne(gameHistorySearch)) {
            newWaitingQueue.push(waiting);
        }
    }
    game.waiting = newWaitingQueue;
};

exports.dequeueWaiting = game => {
    if (game.waiting && game.waiting.length) {
        game.waiting.shift();
    }
};

exports.decreasePlayersAttributesRemainingPhases = game => {
    const alivePlayersWithAttributes = getAlivePlayers(game).filter(({ attributes }) => attributes);
    for (const player of alivePlayersWithAttributes) {
        player.attributes = player.attributes.filter(({ remainingPhases }) => remainingPhases !== 1);
        for (const playerAttribute of player.attributes) {
            if (playerAttribute.remainingPhases && isPlayerAttributeActive(playerAttribute, game)) {
                playerAttribute.remainingPhases--;
            }
        }
    }
};

exports.fillWaitingQueueWithDayActions = async(game, gameHistoryEntry) => {
    const playerAttributeMethods = [
        { attribute: "eaten", trigger: Player.eaten },
        { attribute: "drank-death-potion", trigger: Player.drankDeathPotion },
    ];
    const alivePlayers = getAlivePlayers(game);
    for (const player of alivePlayers) {
        for (const { attribute, trigger } of playerAttributeMethods) {
            const playerAttribute = getPlayerAttribute(player, attribute);
            if (playerAttribute) {
                await trigger(game, playerAttribute, gameHistoryEntry);
            }
        }
    }
    if (await this.isTimeToElectSheriff(game)) {
        game.waiting.push({ for: "all", to: "elect-sheriff" });
    }
};

exports.isGroupCallableDuringTheNight = (game, group) => {
    if (group === "lovers") {
        const cupidPlayer = getPlayerWithRole("cupid", game);
        return !!cupidPlayer && !doesPlayerHaveAttribute(cupidPlayer, "powerless");
    } else if (group === "charmed") {
        const piedPiperPlayer = getPlayerWithRole("pied-piper", game);
        return piedPiperPlayer?.isAlive && (piedPiperPlayer.side.current === "villagers" || !game.options.roles.piedPiper.isPowerlessIfInfected) &&
            !doesPlayerHaveAttribute(piedPiperPlayer, "powerless");
    }
    const players = getPlayersWithSide(group, game);
    return game.tick === 1 ? !!players.length : !!players.length && players.some(({ isAlive }) => isAlive);
};

exports.isWhiteWerewolfCallableDuringTheNight = async game => {
    const { wakingUpInterval: whiteWerewolfWakingUpInterval } = game.options.roles.whiteWerewolf;
    const whiteWerewolfPlayer = getPlayerWithRole("white-werewolf", game);
    const lastWhiteWerewolfPlay = await GameHistory.getLastWhiteWerewolfPlay(game._id);
    const turnsSinceLastWhiteWerewolfPlay = lastWhiteWerewolfPlay ? game.turn - lastWhiteWerewolfPlay.turn : undefined;
    return whiteWerewolfPlayer?.isAlive && (!lastWhiteWerewolfPlay || turnsSinceLastWhiteWerewolfPlay >= whiteWerewolfWakingUpInterval);
};

exports.areThreeBrothersCallableDuringTheNight = async game => {
    const brothersWakingUpInterval = game.options.roles.threeBrothers.wakingUpInterval;
    const lastBrothersPlay = await GameHistory.getLastBrothersPlay(game._id);
    const brotherPlayers = getPlayersWithRole("three-brothers", game);
    const turnsSinceLastBrothersPlay = lastBrothersPlay ? game.turn - lastBrothersPlay.turn : undefined;
    return brotherPlayers.filter(brother => brother.isAlive).length >= 2 &&
        (!lastBrothersPlay || turnsSinceLastBrothersPlay >= brothersWakingUpInterval && brothersWakingUpInterval);
};

exports.areTwoSistersCallableDuringTheNight = async game => {
    const sistersWakingUpInterval = game.options.roles.twoSisters.wakingUpInterval;
    const lastSistersPlay = await GameHistory.getLastSistersPlay(game._id);
    const sisterPlayers = getPlayersWithRole("two-sisters", game);
    const turnsSinceLastSistersPlay = lastSistersPlay ? game.turn - lastSistersPlay.turn : undefined;
    return sisterPlayers.every(({ isAlive }) => isAlive) &&
        (!lastSistersPlay || turnsSinceLastSistersPlay >= sistersWakingUpInterval && sistersWakingUpInterval);
};

exports.isRoleCallableDuringTheNight = (game, role) => {
    const player = getPlayerWithRole(role, game);
    if (!player || doesPlayerHaveAttribute(player, "powerless")) {
        return false;
    }
    if (role === "two-sisters") {
        return this.areTwoSistersCallableDuringTheNight(game);
    } else if (role === "three-brothers") {
        return this.areThreeBrothersCallableDuringTheNight(game);
    } else if (role === "pied-piper") {
        return player.isAlive && (player.side.current === "villagers" || !game.options.roles.piedPiper.isPowerlessIfInfected);
    } else if (role === "white-werewolf") {
        return this.isWhiteWerewolfCallableDuringTheNight(game);
    }
    return !!player && player.isAlive;
};

exports.isSheriffCallableDuringTheNight = game => {
    const isSheriffEnabled = getProp(game, "options.roles.sheriff.isEnabled", true);
    const sheriffPlayer = getPlayerWithAttribute("sheriff", game);
    return isSheriffEnabled && !!sheriffPlayer && sheriffPlayer.isAlive;
};

exports.isSourceCallableDuringTheNight = (game, source, action) => {
    if (source === "all") {
        if (action === "vote") {
            return !!getPlayerWithRole("angel", game);
        }
    } else if (source === "sheriff") {
        return this.isSheriffCallableDuringTheNight(game);
    }
    const sourceType = getGroupNames().includes(source) ? "group" : "role";
    return sourceType === "group" ? this.isGroupCallableDuringTheNight(game, source) : this.isRoleCallableDuringTheNight(game, source);
};

exports.isTimeToElectSheriff = async game => {
    const sheriffOptions = game.options.roles.sheriff;
    if (sheriffOptions.isEnabled && game.turn === sheriffOptions.electedAt.turn && game.phase === sheriffOptions.electedAt.phase) {
        const allElectSheriffPlays = await GameHistory.find({ "gameId": game._id, "play.source.name": "all", "play.action": "elect-sheriff" });
        return !allElectSheriffPlays.length;
    }
    return false;
};

exports.getWaitingQueueWithNightActions = async game => {
    let actionsOrder;
    if (game.turn === 1 && game.phase === "night") {
        actionsOrder = getGameTurnNightActionsOrder();
    } else {
        actionsOrder = getGameTurnNightActionsOrder().filter(action => !action.isFirstNightOnly);
    }
    const waitingQueue = [];
    if (await this.isTimeToElectSheriff(game)) {
        waitingQueue.push({ for: "all", to: "elect-sheriff" });
    }
    for (const { source, action } of actionsOrder) {
        if (await this.isSourceCallableDuringTheNight(game, source, action)) {
            waitingQueue.push({ for: source, to: action });
        }
    }
    return waitingQueue;
};

exports.fillWaitingQueue = async(game, gameHistoryEntry) => {
    if (game.phase === "night") {
        game.phase = "day";
        await this.fillWaitingQueueWithDayActions(game, gameHistoryEntry);
        if (isVotePossible(game)) {
            game.waiting.push({ for: "all", to: "vote" });
        }
        this.decreasePlayersAttributesRemainingPhases(game);
        Player.makeBearTamerGrowls(game);
        if (!game.waiting.length) {
            await this.fillWaitingQueue(game, gameHistoryEntry);
        }
    } else if (game.phase === "day") {
        await this.fillWaitingQueueWithDayActions(game, gameHistoryEntry);
        if (!game.waiting || !game.waiting.length) {
            await Player.makeWerewolfDiesFromDisease(game, gameHistoryEntry);
            this.decreasePlayersAttributesRemainingPhases(game);
            game.phase = "night";
            game.turn++;
            game.waiting = await this.getWaitingQueueWithNightActions(game);
        }
    }
};

exports.generatePlayMethods = () => ({
    "all": Player.allPlay,
    "seer": Player.seerPlays,
    "witch": Player.witchPlays,
    "guard": Player.guardPlays,
    "raven": Player.ravenPlays,
    "hunter": Player.hunterPlays,
    "werewolves": Player.werewolvesPlay,
    "sheriff": Player.sheriffPlays,
    "cupid": Player.cupidPlays,
    "lovers": () => undefined,
    "two-sisters": () => undefined,
    "three-brothers": () => undefined,
    "wild-child": Player.wildChildPlays,
    "dog-wolf": Player.dogWolfPlays,
    "big-bad-wolf": Player.bigBadWolfPlays,
    "scapegoat": Player.scapegoatPlays,
    "pied-piper": Player.piedPiperPlays,
    "charmed": () => undefined,
    "white-werewolf": Player.whiteWerewolfPlays,
    "stuttering-judge": () => undefined,
    "thief": Player.thiefPlays,
    "fox": Player.foxPlays,
});

exports.generateGameHistoryEntry = (game, { source, ...rest }) => ({
    gameId: game._id,
    turn: game.turn,
    phase: game.phase,
    tick: game.tick,
    play: {
        source: {
            name: source,
            players: getPlayersExpectedToPlay(game),
        },
        ...rest,
    },
});

exports.checkPlay = async play => {
    const game = await this.findOne({ _id: play.gameId });
    if (!game) {
        throw generateError("NOT_FOUND", `Game with id "${play.gameId}" not found.`);
    } else if (game.status !== "playing") {
        throw generateError("NO_MORE_PLAY_ALLOWED", `Game with id "${play.gameId}" is not playing but with status "${game.status}".`);
    } else if (game.waiting[0].for !== play.source) {
        throw generateError("BAD_PLAY_SOURCE", `Game is waiting for "${game.waiting[0].for}", not "${play.source}".`);
    } else if (game.waiting[0].to !== play.action) {
        throw generateError("BAD_PLAY_ACTION", `Game is waiting for "${game.waiting[0].for}" to "${game.waiting[0].to}", not "${play.action}".`);
    } else if (play.side && play.action !== "choose-side") {
        throw generateError("BAD_PLAY_ACTION_FOR_SIDE_CHOICE", `"side" can be set only if action is "choose-side", not "${play.action}".`);
    } else if (play.doesJudgeRequestAnotherVote && play.action !== "vote") {
        throw generateError("BAD_PLAY_ACTION_FOR_JUDGE_REQUEST", `"doesJudgeRequestAnotherVote" can be set only if action is "vote", not "${play.action}".`);
    } else if (play.card && play.action !== "choose-card") {
        throw generateError("BAD_PLAY_ACTION_FOR_CHOSEN_CARD", `"card" can be set only if action is "choose-card", not "${play.action}".`);
    }
};

exports.play = async play => {
    await this.checkPlay(play);
    const game = await this.findOne({ _id: play.gameId }, "-gameMaster", { toJSON: true });
    const gameHistoryEntry = this.generateGameHistoryEntry(game, play);
    const playMethods = this.generatePlayMethods();
    await playMethods[play.source](play, game, gameHistoryEntry);
    this.dequeueWaiting(game);
    if (!game.waiting || !game.waiting.length) {
        await this.fillWaitingQueue(game, gameHistoryEntry);
    }
    await GameHistory.create(gameHistoryEntry);
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
        const resetData = { players: game.players.map(player => ({ name: player.name, role: player.role.original })) };
        await this.fillPlayersData(resetData.players);
        this.fillTickData(resetData);
        resetData.options = game.options;
        resetData.waiting = await this.getWaitingQueueWithNightActions(resetData);
        game = await this.findOneAndUpdate({ _id: params.id }, resetData);
        res.status(200).json(game);
    } catch (e) {
        sendError(res, e);
    }
};

exports.isCurrentPlaySecondVoteAfterTie = async game => {
    const previousPlay = await GameHistory.getPreviousPlay(game._id);
    const currentPlay = game?.waiting.length ? game.waiting[0] : undefined;
    return currentPlay?.to === "vote" && previousPlay?.play.action === "vote" &&
        previousPlay.turn === game.turn && previousPlay.play.votesResult === "need-settlement";
};