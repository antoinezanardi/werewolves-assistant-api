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
        auth: {
            user: process.env.DB_USER,
            pass: process.env.DB_PASSWORD,
        },
    },
    sentry: {
        enabled: process.env.SENTRY_ENABLED === "true",
        projectID: process.env.SENTRY_PROJECT_ID,
        key: process.env.SENTRY_KEY,
    },
    google: { client: { ID: process.env.GOOGLE_CLIENT_ID } },
    facebook: { app: { ID: process.env.FACEBOOK_APP_ID } },
};

if (Config.app.nodeEnv === "test") {
    Config.db.name += "-test";
}

module.exports = Config;