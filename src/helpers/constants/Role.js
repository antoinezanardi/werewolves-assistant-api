exports.roleNames = ["villager", "werewolf", "seer", "guard", "witch", "hunter", "raven", "little-girl", "villager-villager"];

exports.groupNames = ["villagers", "werewolves"];

exports.roles = [
    { name: "villager", group: "villagers", maxInGame: 9 },
    { name: "villager-villager", group: "villagers", maxInGame: 1 },
    { name: "seer", group: "villagers", maxInGame: 1, powers: [{ name: "look" }] },
    { name: "guard", group: "villagers", maxInGame: 1, powers: [{ name: "protect" }] },
    { name: "witch", group: "villagers", maxInGame: 1, powers: [{ name: "use-potion" }] },
    { name: "hunter", group: "villagers", maxInGame: 1, powers: [{ name: "shoot" }] },
    { name: "raven", group: "villagers", maxInGame: 1, powers: [{ name: "mark" }] },
    { name: "little-girl", group: "villagers", maxInGame: 1 },
    { name: "werewolf", group: "werewolves", maxInGame: 4, powers: [{ name: "eat" }] },
];