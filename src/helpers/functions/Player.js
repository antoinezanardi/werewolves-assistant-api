exports.canBeEaten = player => !this.hasAttribute(player, "protected") && !this.hasAttribute(player, "drank-life-potion");

exports.hasAttribute = (player, attributeName) => player.attributes && player.attributes.findIndex(({ attribute }) => attribute === attributeName) !== -1;