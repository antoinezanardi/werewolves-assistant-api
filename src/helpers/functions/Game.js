exports.isWerewolfSideAlive = game => !!game.players.filter(player => player.role.group === "werewolves" && player.isAlive).length;

exports.isVillagerSideAlive = game => !!game.players.filter(player => player.role.group === "villagers" && player.isAlive).length;