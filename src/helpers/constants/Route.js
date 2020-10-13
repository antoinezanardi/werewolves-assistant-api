const rateLimit = require("express-rate-limit");
const Config = require("../../../config");
const { generateError } = require("../functions/Error");

function rateLimitHandler(req, res, message) {
    res.status(429).json(generateError("TOO_MANY_REQUESTS", message));
}

exports.createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: Config.app.nodeEnv !== "test" ? 5 : 0,
    handler: (req, res) => rateLimitHandler(req, res, "Too many requests. Please try again in 1 hour"),
});

exports.loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: Config.app.nodeEnv !== "test" ? 10 : 0,
    handler: (req, res) => rateLimitHandler(req, res, "Too many requests. Please try again in 10 minutes"),
});

exports.basicLimiter = rateLimit({
    windowMs: 1000,
    max: Config.app.nodeEnv !== "test" ? 3 : 0,
    handler: (req, res) => rateLimitHandler(req, res, "Too many requests. Please try later."),
});