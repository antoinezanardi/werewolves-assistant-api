exports.roleNames = [
    "villager",
    "werewolf",
    "seer",
    "guard",
    "witch",
    "hunter",
    "raven",
    "little-girl",
    "villager-villager",
    "cupid",
    "two-sisters",
    "three-brothers",
    "wild-child",
    "dog-wolf",
];

exports.sideNames = ["villagers", "werewolves"];

exports.groupNames = ["villagers", "werewolves", "lovers"];

exports.roles = [
    { name: "villager", group: "villagers", maxInGame: 9 },
    { name: "villager-villager", group: "villagers", maxInGame: 1 },
    { name: "seer", group: "villagers", maxInGame: 1, powers: [{ name: "look" }] },
    { name: "guard", group: "villagers", maxInGame: 1, powers: [{ name: "protect" }] },
    { name: "witch", group: "villagers", maxInGame: 1, powers: [{ name: "use-potion" }] },
    { name: "hunter", group: "villagers", maxInGame: 1, powers: [{ name: "shoot" }] },
    { name: "raven", group: "villagers", maxInGame: 1, powers: [{ name: "mark" }] },
    { name: "little-girl", group: "villagers", maxInGame: 1 },
    { name: "cupid", group: "villagers", maxInGame: 1, powers: [{ name: "charm" }] },
    { name: "two-sisters", group: "villagers", minInGame: 2, maxInGame: 2, recommendedMinPlayers: 12 },
    { name: "three-brothers", group: "villagers", minInGame: 3, maxInGame: 3, recommendedMinPlayers: 15 },
    { name: "wild-child", group: "villagers", maxInGame: 1 },
    { name: "dog-wolf", group: "villagers", maxInGame: 1 },
    { name: "werewolf", group: "werewolves", maxInGame: 4, powers: [{ name: "eat" }] },
];