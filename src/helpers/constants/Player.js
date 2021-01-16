exports.playerAttributes = [
    { name: "sheriff", source: "all" },
    { name: "seen", source: "seer", remainingPhases: 1 },
    { name: "eaten", source: "werewolves", remainingPhases: 1 },
    { name: "eaten", source: "big-bad-wolf", remainingPhases: 1 },
    { name: "infected", source: "vile-father-of-wolves", remainingPhases: 1 },
    { name: "drank-life-potion", source: "witch", remainingPhases: 1 },
    { name: "drank-death-potion", source: "witch", remainingPhases: 1 },
    { name: "protected", source: "guard", remainingPhases: 1 },
    { name: "raven-marked", source: "raven", remainingPhases: 2 },
    { name: "in-love", source: "cupid" },
    { name: "worshiped", source: "wild-child" },
    { name: "powerless", source: "ancient" },
    { name: "cant-vote", source: "scapegoat", remainingPhases: 2 },
    { name: "cant-vote", source: "all" },
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
    "ban-voting",
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