const { roles, roleNames, sideNames, groupNames } = require("../constants/Role");

exports.getRoles = () => JSON.parse(JSON.stringify(roles));

exports.getRoleNames = () => JSON.parse(JSON.stringify(roleNames));

exports.getSideNames = () => JSON.parse(JSON.stringify(sideNames));

exports.getGroupNames = () => JSON.parse(JSON.stringify(groupNames));