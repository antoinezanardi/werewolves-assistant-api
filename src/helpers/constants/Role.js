exports.roleNames = ["villager", "wolf", "seer", "protector", "witch", "hunter", "raven"];

exports.groupNames = ["villagers", "wolves"];

exports.roles = [
    { name: "villager", group: "villagers", maxInGame: 19 },
    { name: "seer", group: "villagers", maxInGame: 1, powers: [{ name: "look" }] },
    { name: "protector", group: "villagers", maxInGame: 1, powers: [{ name: "protect" }] },
    { name: "witch", group: "villagers", maxInGame: 1, powers: [{ name: "use-potion" }] },
    { name: "hunter", group: "villagers", maxInGame: 1, powers: [{ name: "shoot" }] },
    { name: "raven", group: "villagers", maxInGame: 1, powers: [{ name: "mark" }] },
    { name: "wolf", group: "wolves", maxInGame: 4, powers: [{ name: "eat" }] },
];