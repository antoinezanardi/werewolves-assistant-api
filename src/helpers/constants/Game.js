const { roleNames, groupNames } = require("./Role");

exports.gamePhases = ["day", "night"];

exports.gameStatuses = ["playing", "done", "canceled"];

exports.patchableGameStatuses = ["canceled"];

exports.waitingForPossibilities = [...roleNames, ...groupNames, "sheriff", "all"];

exports.wonByPossibilities = ["wolves", "villagers"];

exports.populate = [
    { path: "gameMaster", select: "-password" },
    { path: "history" },
];

exports.turnPreNightActionsOrder = [
    { source: "all", action: "elect-sheriff" },
];

exports.turnNightActionsOrder = [
    { source: "seer", action: "look" },
    { source: "wolves", action: "eat" },
    { source: "witch", action: "use-potion" },
    { source: "protector", action: "protect" },
    { source: "raven", action: "mark" },
];