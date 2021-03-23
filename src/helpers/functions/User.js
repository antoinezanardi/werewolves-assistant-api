const { registrationMethods } = require("../constants/User");
const { generateError } = require("./Error");

exports.checkJWTUserRights = (req, userId) => {
    if (req.user.strategy === "JWT" && userId.toString() !== req.user._id.toString()) {
        throw generateError("UNAUTHORIZED", "You can't access other's data.");
    }
};

exports.getRegistrationMethods = () => JSON.parse(JSON.stringify(registrationMethods));