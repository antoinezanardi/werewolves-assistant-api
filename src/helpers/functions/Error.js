const Error = require("../../classes/Error");
const Config = require("../../../config");

exports.generateError = (errorType, data) => new Error(errorType, data);

exports.sendUniqueViolationError = (res, e) => {
    const myRegexp = new RegExp(`${Config.db.name}.([a-z]+)`, "u");
    const match = myRegexp.exec(e.toString());
    if (match[1] === "users") {
        res.status(400).json(this.generateError("EMAIL_EXISTS", e.toString()));
    } else {
        res.status(500).json(this.generateError("INTERNAL_SERVER_ERROR", e.toString()));
    }
};

exports.sendError = (res, e) => {
    if (e && res.headersSent) {
        // eslint-disable-next-line no-console
        console.log(e);
    } else if (e && e.response && e.response.data && e.response.data.HTTPCode) {
        res.status(e.response.data.HTTPCode).json(this.generateError(e.response.data.type, e.response.data.error || e.response.data.errors));
    } else if (e && e instanceof Error) {
        res.status(e.HTTPCode).json(e);
    } else if (e && e.code === 11000) {
        this.sendUniqueViolationError(res, e);
    } else if (e && e.constructor && e.constructor.name === "JsonWebTokenError") {
        res.status(401).json(this.generateError("UNAUTHORIZED", e.toString()));
    } else if (e) {
        res.status(500).json(this.generateError("INTERNAL_SERVER_ERROR", e.toString()));
    }
};