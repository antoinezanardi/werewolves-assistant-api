exports.playerAttributes = [
    { attribute: "mayor", source: "all" },
    { attribute: "seen", source: "seer", remainingPhases: 1 },
    { attribute: "eaten", source: "wolves", remainingPhases: 1 },
    { attribute: "drank-life-potion", source: "witch", remainingPhases: 1 },
    { attribute: "drank-death-potion", source: "witch", remainingPhases: 1 },
    { attribute: "protected", source: "protector", remainingPhases: 1 },
    { attribute: "raven-marked", source: "raven", remainingPhases: 1 },
];

exports.playerActions = ["eat", "use-potion", "look", "protect", "shoot", "mark", "elect-mayor", "delegate", "settle-votes", "vote"];

exports.murderedPossibilities = [
    { by: "witch", of: "use-potion" },
    { by: "wolves", of: "eat" },
    { by: "hunter", of: "shoot" },
    { by: "mayor", of: "settle-votes" },
    { by: "all", of: "vote" },
];