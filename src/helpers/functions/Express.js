const { validationResult, matchedData } = require("express-validator");
const Error = require("../../classes/Error");

exports.checkRequestData = req => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new Error("BAD_REQUEST", errors.array());
    }
    return {
        body: matchedData(req, { locations: ["body"] }),
        query: matchedData(req, { locations: ["query"] }),
        params: matchedData(req, { locations: ["params"] }),
        cookies: matchedData(req, { locations: ["cookies"] }),
        headers: matchedData(req, { locations: ["headers"] }),
    };
};