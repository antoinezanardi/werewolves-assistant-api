require("dotenv").config();
require("./src/helpers/functions/Passport");
const { bold } = require("colors");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const Config = require("./config");
const { sendError, generateError } = require("./src/helpers/functions/Error");
const { connect: connectDatabase } = require("./src/helpers/functions/Mongoose");

if (Config.sentry.enabled) {
    const Sentry = require("@sentry/node");
    Sentry.init({ dsn: `https://${Config.sentry.key}@sentry.io/${Config.sentry.projectID}` });
}
connectDatabase().then(() => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors({ origin: "*" }));
    app.use(express.static("public"));
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError) {
            sendError(res, generateError("BAD_REQUEST", "Couldn't parse JSON."));
        } else {
            next();
        }
    });
    const routes = require("./src/routes");
    routes(app);
    app.listen(Config.app.port);
    console.log(`${bold("🐺 Werewolves Assistant API")} server started on port ${bold.blue(Config.app.port)} and running on database ${bold.green(Config.db.name)}.`);
    console.log(`${bold("📚 API Documentation:")} http://localhost:${Config.app.port}/apidoc`);
    app.emit("ready");
});

module.exports = app;