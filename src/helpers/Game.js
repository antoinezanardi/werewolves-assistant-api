const { roleNames, groupNames } = require("./Role");

exports.gamePhases = ["day", "night"];

exports.gameStatuses = ["assigning-roles", "on-going", "done"];

exports.waitingForPossibilities = [...roleNames, ...groupNames, "mayor"];

exports.gameActions = ["eat", "use-potion", "look", "protect", "shoot", "mark", "delegate", "settle", "vote"];