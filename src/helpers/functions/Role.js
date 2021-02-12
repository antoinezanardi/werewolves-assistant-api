const { roles, roleNames, sideNames, groupNames } = require("../constants/Role");

exports.getRoles = () => JSON.parse(JSON.stringify(roles));

exports.getVillagerRoles = () => JSON.parse(JSON.stringify(roles.filter(({ side }) => side === "villagers")));

exports.getWerewolfRoles = () => JSON.parse(JSON.stringify(roles.filter(({ side }) => side === "werewolves")));

exports.getRoleNames = () => JSON.parse(JSON.stringify(roleNames));

exports.getSideNames = () => JSON.parse(JSON.stringify(sideNames));

exports.getGroupNames = () => JSON.parse(JSON.stringify(groupNames));