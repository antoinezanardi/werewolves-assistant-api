require("dotenv").config();

const Config = {
    app: {
        nodeEnv: process.env.NODE_ENV || "production",
        port: process.env.PORT || 4202,
        JWTSecret: process.env.JWT_SECRET || "somethingsecret",
        basicAuth: {
            username: process.env.BASIC_USERNAME || "root",
            password: process.env.BASIC_PASSWORD || "secret",
        },
    },
    db: {
        name: process.env.DB_NAME || "werewolves-assistant",
    },
};

if (Config.app.nodeEnv === "test") {
    Config.db.name += "-test";
}

module.exports = Config;