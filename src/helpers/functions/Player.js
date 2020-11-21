const { playerAttributes, murderedPossibilities, playerActions } = require("../constants/Player");

exports.canBeEaten = player => !this.hasAttribute(player, "drank-life-potion") && (!this.hasAttribute(player, "protected") ||
                                player.role.current === "little-girl");

exports.hasAttribute = ({ attributes }, attributeName) => attributes && attributes.findIndex(({ attribute }) => attribute === attributeName) !== -1;

exports.getPlayerAttributes = () => JSON.parse(JSON.stringify(playerAttributes));

exports.getPlayerAttribute = attribute => this.getPlayerAttributes().find(playerAttribute => playerAttribute.attribute === attribute);

exports.getPlayerActions = () => JSON.parse(JSON.stringify(playerActions));

exports.getPlayerMurderedPossibilities = () => JSON.parse(JSON.stringify(murderedPossibilities));