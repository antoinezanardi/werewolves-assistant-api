const { roleNames, groupNames } = require("./Role");

exports.gamePhases = ["day", "night"];

exports.gameStatuses = ["assigning-roles", "playing", "done"];

exports.waitingForPossibilities = [...roleNames, ...groupNames, "mayor"];

exports.populate = [
    { path: "gameMaster" },
];