const { patchableGameStatuses, waitingForPossibilities, gameStatuses } = require("../constants/Game");

exports.isWerewolfSideAlive = game => !!game.players.filter(player => player.role.group === "werewolves" && player.isAlive).length;

exports.isVillagerSideAlive = game => !!game.players.filter(player => player.role.group === "villagers" && player.isAlive).length;

exports.getPatchableGameStatuses = () => JSON.parse(JSON.stringify(patchableGameStatuses));

exports.getWaitingForPossibilities = () => JSON.parse(JSON.stringify(waitingForPossibilities));

exports.getGameStatuses = () => JSON.parse(JSON.stringify(gameStatuses));