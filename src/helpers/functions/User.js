const { generateError } = require("./Error");

exports.checkJWTUserRights = (req, userId) => {
    if (req.user.strategy === "JWT" && userId.toString() !== req.user._id.toString()) {
        throw generateError("UNAUTHORIZED", "You can't access other's data.");
    }
};