const { playerAttributes, murderedPossibilities, playerActions } = require("../constants/Player");

exports.canBeEaten = player => !this.doesPlayerHaveAttribute(player, "drank-life-potion") && (!this.doesPlayerHaveAttribute(player, "protected") ||
                                player.role.current === "little-girl");

exports.isAncientKillable = (action, alreadyRevealed) => action !== "eat" || alreadyRevealed;

exports.doesPlayerHaveAttribute = ({ attributes }, attributeName) => attributes &&
    attributes.findIndex(({ name }) => name === attributeName) !== -1;

exports.getAttributes = () => JSON.parse(JSON.stringify(playerAttributes));

exports.getAttributeWithName = attributeName => this.getAttributes().find(({ name }) => name === attributeName);

exports.getAttributeWithNameAndSource = (attributeName, attributeSource) => this.getAttributes().find(({ name, source }) => name === attributeName &&
    source === attributeSource);

exports.getPlayerActions = () => JSON.parse(JSON.stringify(playerActions));

exports.getPlayerMurderedPossibilities = () => JSON.parse(JSON.stringify(murderedPossibilities));

exports.getPlayerAttribute = ({ attributes }, attributeName) => attributes && attributes.find(({ name }) => name === attributeName);

exports.getPlayerAttributes = () => JSON.parse(JSON.stringify(playerAttributes));

exports.isPlayerAttributeActive = ({ activeAt }, game) => !activeAt || activeAt.turn <= game.turn &&
    (!activeAt.phase || activeAt.phase === "night" || game.phase === "day");