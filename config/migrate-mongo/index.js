const Config = require("../index");

console.log(process.env.NODE_ENV);
module.exports = {
    mongodb: {
        url: "mongodb://localhost/",
        databaseName: Config.db.name,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    migrationsDir: "src/db/migrations",
    changelogCollectionName: "changelog",
};