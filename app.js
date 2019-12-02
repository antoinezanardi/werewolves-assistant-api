require("dotenv").config();
require("./src/helpers/Passport");

const { bold } = require("colors");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const Config = require("./config");
const { sendError, generateError } = require("./src/helpers/Error");
const { connect: connectDatabase } = require("./src/helpers/Mongoose");

connectDatabase();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) {
        sendError(res, generateError("BAD_REQUEST", "Couldn't parse JSON"));
    } else {
        next();
    }
});

const routes = require("./src/routes");
routes(app);

app.use(express.static("public"));

app.listen(Config.app.port);

console.log(`${bold("Werewolves Assistant API")} server started on port ${bold.blue(Config.app.port)} and running on database ${bold.green(Config.db.name)}.`);