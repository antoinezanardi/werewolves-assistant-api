const { roleNames, groupNames } = require("./Role");

exports.gamePhases = ["day", "night"];

exports.gameStatuses = ["playing", "done", "canceled"];

exports.patchableGameStatuses = ["canceled"];

exports.waitingForPossibilities = [...roleNames, ...groupNames, "sheriff", "all"];

exports.wonByPossibilities = ["werewolves", "villagers", "lovers"];

exports.populate = [
    { path: "gameMaster", select: "-password" },
    { path: "history" },
];

exports.turnPreNightActionsOrder = [
    { source: "all", action: "elect-sheriff" },
    { source: "cupid", action: "charm" },
    { source: "lovers", action: "meet-each-other" },
];

exports.turnNightActionsOrder = [
    { source: "seer", action: "look" },
    { source: "raven", action: "mark" },
    { source: "guard", action: "protect" },
    { source: "werewolves", action: "eat" },
    { source: "witch", action: "use-potion" },
];