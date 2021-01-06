const { roleNames, groupNames } = require("./Role");

exports.gamePhases = ["day", "night"];

exports.gameStatuses = ["playing", "done", "canceled"];

exports.patchableGameStatuses = ["canceled"];

exports.waitingForPossibilities = [...roleNames, ...groupNames, "sheriff", "all"];

exports.wonByPossibilities = ["werewolves", "villagers", "lovers"];

exports.populate = [
    { path: "gameMaster", select: "-password" },
    { path: "history", limit: 3 },
];

exports.turnNightActionsOrder = [
    { source: "all", action: "elect-sheriff", isFirstNightOnly: true },
    { source: "dog-wolf", action: "choose-side", isFirstNightOnly: true },
    { source: "cupid", action: "charm", isFirstNightOnly: true },
    { source: "lovers", action: "meet-each-other", isFirstNightOnly: true },
    { source: "seer", action: "look" },
    { source: "two-sisters", action: "meet-each-other" },
    { source: "three-brothers", action: "meet-each-other" },
    { source: "wild-child", action: "choose-model", isFirstNightOnly: true },
    { source: "raven", action: "mark" },
    { source: "guard", action: "protect" },
    { source: "werewolves", action: "eat" },
    { source: "big-bad-wolf", action: "eat" },
    { source: "witch", action: "use-potion" },
];

exports.findFields = ["status"];

exports.defaultGameOptions = {
    roles: {
        sheriff: { enabled: true, hasDoubledVote: true },
        seer: { isTalkative: true },
        twoSisters: { wakingUpInterval: 2 },
        threeBrothers: { wakingUpInterval: 2 },
    },
};