exports.sideNames = ["villagers", "werewolves"];

exports.groupNames = [...this.sideNames, "lovers", "charmed"];

exports.roles = [
    { name: "werewolf", side: "werewolves", maxInGame: 99, type: "werewolf" },
    { name: "big-bad-wolf", side: "werewolves", maxInGame: 1, recommendedMinPlayers: 15, type: "werewolf" },
    { name: "vile-father-of-wolves", side: "werewolves", maxInGame: 1, recommendedMinPlayers: 12, type: "werewolf" },
    { name: "white-werewolf", side: "werewolves", maxInGame: 1, recommendedMinPlayers: 12, type: "lonely" },
    { name: "villager", side: "villagers", maxInGame: 99, type: "villager" },
    { name: "villager-villager", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "seer", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "cupid", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "witch", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "hunter", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "little-girl", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "guard", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "ancient", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "scapegoat", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "idiot", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "two-sisters", side: "villagers", minInGame: 2, maxInGame: 2, recommendedMinPlayers: 12, type: "villager" },
    { name: "three-brothers", side: "villagers", minInGame: 3, maxInGame: 3, recommendedMinPlayers: 15, type: "villager" },
    { name: "fox", side: "villagers", maxInGame: 1, recommendedMinPlayers: 12, type: "villager" },
    { name: "bear-tamer", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "stuttering-judge", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "rusty-sword-knight", side: "villagers", maxInGame: 1, type: "villager" },
    { name: "thief", side: "villagers", maxInGame: 1, type: "ambiguous" },
    { name: "wild-child", side: "villagers", maxInGame: 1, type: "ambiguous" },
    { name: "dog-wolf", side: "villagers", maxInGame: 1, type: "ambiguous" },
    { name: "angel", side: "villagers", maxInGame: 1, type: "lonely" },
    { name: "pied-piper", side: "villagers", maxInGame: 1, recommendedMinPlayers: 12, type: "lonely" },
    { name: "abominable-sectarian", side: "villagers", maxInGame: 1, recommendedMinPlayers: 12, type: "lonely" },
    { name: "raven", side: "villagers", maxInGame: 1, type: "villager" },
];

exports.roleNames = this.roles.map(({ name }) => name);