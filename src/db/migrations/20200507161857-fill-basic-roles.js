module.exports = {
    async up(db) {
        return await db.collection("roles").insertMany([
            { name: "villager", group: "villagers", maxInGame: 19 },
            { name: "seer", group: "villagers", maxInGame: 1, powers: [{ name: "look" }] },
            { name: "protector", group: "villagers", maxInGame: 1, powers: [{ name: "protect" }] },
            { name: "witch", group: "villagers", maxInGame: 1, powers: [{ name: "use-potion" }] },
            { name: "hunter", group: "villagers", maxInGame: 1, powers: [{ name: "shoot" }] },
            { name: "raven", group: "villagers", maxInGame: 1, powers: [{ name: "mark" }] },
            { name: "wolf", group: "wolves", maxInGame: 4, powers: [{ name: "eat" }] },
        ]);
    },

    async down(db) {
        return await db.collection("roles").deleteMany({});
    },
};