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
    "big-bad-wolf",
];

exports.sideNames = ["villagers", "werewolves"];

exports.groupNames = [...this.sideNames, "lovers"];

exports.roles = [
    { name: "villager", side: "villagers", maxInGame: 9 },
    { name: "villager-villager", side: "villagers", maxInGame: 1 },
    { name: "seer", side: "villagers", maxInGame: 1, powers: [{ name: "look" }] },
    { name: "guard", side: "villagers", maxInGame: 1, powers: [{ name: "protect" }] },
    { name: "witch", side: "villagers", maxInGame: 1, powers: [{ name: "use-potion" }] },
    { name: "hunter", side: "villagers", maxInGame: 1, powers: [{ name: "shoot" }] },
    { name: "raven", side: "villagers", maxInGame: 1, powers: [{ name: "mark" }] },
    { name: "little-girl", side: "villagers", maxInGame: 1 },
    { name: "cupid", side: "villagers", maxInGame: 1, powers: [{ name: "charm" }] },
    { name: "two-sisters", side: "villagers", minInGame: 2, maxInGame: 2, recommendedMinPlayers: 12 },
    { name: "three-brothers", side: "villagers", minInGame: 3, maxInGame: 3, recommendedMinPlayers: 15 },
    { name: "wild-child", side: "villagers", maxInGame: 1 },
    { name: "dog-wolf", side: "villagers", maxInGame: 1 },
    { name: "werewolf", side: "werewolves", maxInGame: 4, powers: [{ name: "eat" }] },
    { name: "big-bad-wolf", side: "werewolves", maxInGame: 1, powers: [{ name: "eat" }], recommendedMinPlayers: 12 },
];