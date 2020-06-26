exports.roleNames = ["villager", "werewolf", "seer", "guard", "witch", "hunter", "raven"];

exports.groupNames = ["villagers", "werewolves"];

exports.roles = [
    { name: "villager", group: "villagers", maxInGame: 19 },
    { name: "seer", group: "villagers", maxInGame: 1, powers: [{ name: "look" }] },
    { name: "guard", group: "villagers", maxInGame: 1, powers: [{ name: "protect" }] },
    { name: "witch", group: "villagers", maxInGame: 1, powers: [{ name: "use-potion" }] },
    { name: "hunter", group: "villagers", maxInGame: 1, powers: [{ name: "shoot" }] },
    { name: "raven", group: "villagers", maxInGame: 1, powers: [{ name: "mark" }] },
    { name: "werewolf", group: "werewolves", maxInGame: 4, powers: [{ name: "eat" }] },
];