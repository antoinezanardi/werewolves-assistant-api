module.exports = {
    async up(db) {
        return await db.collection("roles").insertMany([
            { name: "villager", group: "villagers", maxInGame: 19 },
            { name: "seer", group: "villagers", maxInGame: 1 },
            { name: "protector", group: "villagers", maxInGame: 1 },
            { name: "witch", group: "villagers", maxInGame: 1 },
            { name: "hunter", group: "villagers", maxInGame: 1 },
            { name: "raven", group: "villagers", maxInGame: 1 },
            { name: "wolf", group: "wolves", maxInGame: 4 },
        ]);
    },

    async down(db) {
        return await db.collection("roles").deleteMany({});
    },
};