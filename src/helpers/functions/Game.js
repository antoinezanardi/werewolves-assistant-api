const { patchableGameStatuses, waitingForPossibilities, gameStatuses, turnNightActionsOrder } = require("../constants/Game");
const { doesPlayerHaveAttribute } = require("./Player");

exports.isWerewolfSideAlive = game => game.players.some(player => player.side.current === "werewolves" && player.isAlive);

exports.areAllWerewolvesAlive = game => this.getPlayersWithSide("werewolves", game).every(({ isAlive }) => isAlive);

exports.isVillagerSideAlive = game => game.players.some(player => player.side.current === "villagers" && player.isAlive);

exports.areAllPlayersDead = game => game.players.every(player => !player.isAlive);

exports.areLoversTheOnlyAlive = game => !!this.getPlayerWithRole("cupid", game) &&
                                    game.players.every(player => doesPlayerHaveAttribute(player, "in-love") ? player.isAlive : !player.isAlive);

exports.isGameDone = game => this.areAllPlayersDead(game) ||
                            (!this.isVillagerSideAlive(game) || !this.isWerewolfSideAlive(game) || this.areLoversTheOnlyAlive(game)) &&
                            !this.isActionInWaitingQueue(game, "shoot");

exports.isActionInWaitingQueue = (game, action) => game.waiting.some(({ to }) => to === action);

exports.getPatchableGameStatuses = () => JSON.parse(JSON.stringify(patchableGameStatuses));

exports.getWaitingForPossibilities = () => JSON.parse(JSON.stringify(waitingForPossibilities));

exports.getGameStatuses = () => JSON.parse(JSON.stringify(gameStatuses));

exports.getGameTurNightActionsOrder = () => JSON.parse(JSON.stringify(turnNightActionsOrder));

exports.getPlayerWithAttribute = (attributeName, game) => game.players.find(player => doesPlayerHaveAttribute(player, attributeName));

exports.getPlayersWithAttribute = (attributeName, game) => game.players.filter(player => doesPlayerHaveAttribute(player, attributeName));

exports.getPlayerWithRole = (roleName, game) => game.players.find(({ role }) => role.current === roleName);

exports.getPlayersWithRole = (roleName, game) => game.players.filter(({ role }) => role.current === roleName);

exports.getPlayersWithSide = (sideName, game) => game.players.filter(({ side }) => side.current === sideName);

exports.getAlivePlayers = game => game.players.filter(({ isAlive }) => isAlive);