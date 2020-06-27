const { roles } = require("../constants/Role");

exports.getPlayerRoles = () => JSON.parse(JSON.stringify(roles));