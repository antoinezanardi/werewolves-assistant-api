const { roleNames, groupNames } = require("./Role");

exports.gamePhases = ["day", "night"];

exports.gameStatuses = ["playing", "done"];

exports.waitingForPossibilities = [...roleNames, ...groupNames, "mayor"];

exports.populate = [
    { path: "gameMaster", select: "-password" },
];

exports.firstNightPreActionsOrder = [
    { source: "all", action: "elect-mayor" },
];

exports.nightActionsOrder = [
    { source: "seer", action: "look" },
    { source: "wolves", action: "eat" },
    { source: "witch", action: "use-potion" },
    { source: "protector", action: "protect" },
    { source: "raven", action: "mark" },
];