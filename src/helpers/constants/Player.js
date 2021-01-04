exports.playerAttributes = [
    { attribute: "sheriff", source: "all" },
    { attribute: "seen", source: "seer", remainingPhases: 1 },
    { attribute: "eaten", source: "werewolves", remainingPhases: 1 },
    { attribute: "eaten", source: "big-bad-wolf", remainingPhases: 1 },
    { attribute: "drank-life-potion", source: "witch", remainingPhases: 1 },
    { attribute: "drank-death-potion", source: "witch", remainingPhases: 1 },
    { attribute: "protected", source: "guard", remainingPhases: 1 },
    { attribute: "raven-marked", source: "raven", remainingPhases: 2 },
    { attribute: "in-love", source: "cupid" },
    { attribute: "worshiped", source: "wild-child" },
];

exports.playerActions = [
    "eat",
    "use-potion",
    "look",
    "protect",
    "shoot",
    "mark",
    "elect-sheriff",
    "delegate",
    "settle-votes",
    "vote",
    "charm",
    "meet-each-other",
    "choose-model",
    "choose-side",
];

exports.murderedPossibilities = [
    { by: "witch", of: "use-potion" },
    { by: "werewolves", of: "eat" },
    { by: "big-bad-wolf", of: "eat" },
    { by: "hunter", of: "shoot" },
    { by: "sheriff", of: "settle-votes" },
    { by: "all", of: "vote" },
    { by: "cupid", of: "charm" },
];