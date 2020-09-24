const { playerAttributes, murderedPossibilities, playerActions } = require("../constants/Player");

exports.canBeEaten = player => !this.hasAttribute(player, "protected") && !this.hasAttribute(player, "drank-life-potion");

exports.hasAttribute = ({ attributes }, attributeName) => attributes && attributes.findIndex(({ attribute }) => attribute === attributeName) !== -1;

exports.getPlayerAttributes = () => JSON.parse(JSON.stringify(playerAttributes));

exports.getPlayerAttribute = attribute => this.getPlayerAttributes().find(playerAttribute => playerAttribute.attribute === attribute);

exports.getPlayerActions = () => JSON.parse(JSON.stringify(playerActions));

exports.getPlayerMurderedPossibilities = () => JSON.parse(JSON.stringify(murderedPossibilities));