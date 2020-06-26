const { roleNames, groupNames } = require("./Role");

exports.gamePhases = ["day", "night"];

exports.gameStatuses = ["playing", "done", "canceled"];

exports.patchableGameStatuses = ["canceled"];

exports.waitingForPossibilities = [...roleNames, ...groupNames, "sheriff", "all"];

exports.wonByPossibilities = ["werewolves", "villagers"];

exports.populate = [
    { path: "gameMaster", select: "-password" },
    { path: "history" },
];

exports.turnPreNightActionsOrder = [
    { source: "all", action: "elect-sheriff" },
];

exports.turnNightActionsOrder = [
    { source: "seer", action: "look" },
    { source: "werewolves", action: "eat" },
    { source: "witch", action: "use-potion" },
    { source: "guard", action: "protect" },
    { source: "raven", action: "mark" },
];