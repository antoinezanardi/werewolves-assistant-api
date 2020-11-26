const { roles, sideNames } = require("../constants/Role");

exports.getPlayerRoles = () => JSON.parse(JSON.stringify(roles));

exports.getSideNames = () => JSON.parse(JSON.stringify(sideNames));