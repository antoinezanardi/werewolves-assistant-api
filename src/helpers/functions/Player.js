const { playerAttributes, murderedPossibilities, playerActions } = require("../constants/Player");

exports.canBeEaten = player => !this.doesPlayerHaveAttribute(player, "drank-life-potion") && (!this.doesPlayerHaveAttribute(player, "protected") ||
                                player.role.current === "little-girl");

exports.doesPlayerHaveAttribute = ({ attributes }, attributeName) => attributes &&
    attributes.findIndex(({ attribute }) => attribute === attributeName) !== -1;

exports.getAttributes = () => JSON.parse(JSON.stringify(playerAttributes));

exports.getAttribute = attribute => this.getAttributes().find(playerAttribute => playerAttribute.attribute === attribute);

exports.getPlayerActions = () => JSON.parse(JSON.stringify(playerActions));

exports.getPlayerMurderedPossibilities = () => JSON.parse(JSON.stringify(murderedPossibilities));

exports.getPlayerAttribute = ({ attributes }, attributeName) => attributes && attributes.find(({ attribute }) => attribute === attributeName);