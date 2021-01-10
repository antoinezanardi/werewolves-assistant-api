exports.sideNames = ["villagers", "werewolves"];

exports.groupNames = [...this.sideNames, "lovers"];

exports.roles = [
    { name: "werewolf", side: "werewolves", maxInGame: 4 },
    { name: "big-bad-wolf", side: "werewolves", maxInGame: 1, recommendedMinPlayers: 12 },
    { name: "vile-father-of-wolves", side: "werewolves", maxInGame: 1, recommendedMinPlayers: 12 },
    { name: "villager", side: "villagers", maxInGame: 39 },
    { name: "villager-villager", side: "villagers", maxInGame: 1 },
    { name: "seer", side: "villagers", maxInGame: 1 },
    { name: "cupid", side: "villagers", maxInGame: 1 },
    { name: "witch", side: "villagers", maxInGame: 1 },
    { name: "hunter", side: "villagers", maxInGame: 1 },
    { name: "little-girl", side: "villagers", maxInGame: 1 },
    { name: "guard", side: "villagers", maxInGame: 1 },
    { name: "two-sisters", side: "villagers", minInGame: 2, maxInGame: 2, recommendedMinPlayers: 12 },
    { name: "three-brothers", side: "villagers", minInGame: 3, maxInGame: 3, recommendedMinPlayers: 15 },
    { name: "wild-child", side: "villagers", maxInGame: 1 },
    { name: "dog-wolf", side: "villagers", maxInGame: 1 },
    { name: "raven", side: "villagers", maxInGame: 1 },
];

exports.roleNames = this.roles.map(({ name }) => name);