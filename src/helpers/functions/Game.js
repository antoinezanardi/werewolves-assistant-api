const { patchableGameStatuses, waitingForPossibilities, gameStatuses, turnNightActionsOrder } = require("../constants/Game");
const { hasAttribute } = require("./Player");

exports.isWerewolfSideAlive = game => game.players.some(player => player.role.group === "werewolves" && player.isAlive);

exports.isVillagerSideAlive = game => game.players.some(player => player.role.group === "villagers" && player.isAlive);

exports.areAllPlayersDead = game => game.players.every(player => !player.isAlive);

exports.areLoversTheOnlyAlive = game => !!this.getPlayerWithRole("cupid", game) &&
                                    game.players.every(player => hasAttribute(player, "in-love") ? player.isAlive : !player.isAlive);

exports.isGameDone = game => this.areAllPlayersDead(game) ||
                            (!this.isVillagerSideAlive(game) || !this.isWerewolfSideAlive(game) || this.areLoversTheOnlyAlive(game)) &&
                            !this.isActionInWaitingQueue(game, "shoot");

exports.isActionInWaitingQueue = (game, action) => game.waiting.some(({ to }) => to === action);

exports.getPatchableGameStatuses = () => JSON.parse(JSON.stringify(patchableGameStatuses));

exports.getWaitingForPossibilities = () => JSON.parse(JSON.stringify(waitingForPossibilities));

exports.getGameStatuses = () => JSON.parse(JSON.stringify(gameStatuses));

exports.getGameTurNightActionsOrder = () => JSON.parse(JSON.stringify(turnNightActionsOrder));

exports.getPlayerWithAttribute = (attributeName, game) => game.players.find(player => hasAttribute(player, attributeName));

exports.getPlayersWithAttribute = (attributeName, game) => game.players.filter(player => hasAttribute(player, attributeName));

exports.getPlayerWithRole = (roleName, game) => game.players.find(({ role }) => role.current === roleName);

exports.getPlayersWithRole = (roleName, game) => game.players.filter(({ role }) => role.current === roleName);

exports.getPlayersWithGroup = (groupName, game) => game.players.filter(({ role }) => role.group === groupName);