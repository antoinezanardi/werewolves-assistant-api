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

exports.turnNightActionsOrder = [
    { source: "all", action: "elect-sheriff", isFirstNightOnly: true },
    { source: "cupid", action: "charm", isFirstNightOnly: true },
    { source: "lovers", action: "meet-each-other", isFirstNightOnly: true },
    { source: "wild-child", action: "choose-model", isFirstNightOnly: true },
    { source: "seer", action: "look" },
    { source: "two-sisters", action: "meet-each-other" },
    { source: "three-brothers", action: "meet-each-other" },
    { source: "raven", action: "mark" },
    { source: "guard", action: "protect" },
    { source: "werewolves", action: "eat" },
    { source: "witch", action: "use-potion" },
];