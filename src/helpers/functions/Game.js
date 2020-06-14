exports.isWolfSideAlive = game => !!game.players.filter(player => player.role.group === "wolves" && player.isAlive).length;

exports.isVillagerSideAlive = game => !!game.players.filter(player => player.role.group === "villagers" && player.isAlive).length;