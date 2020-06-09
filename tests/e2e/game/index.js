const { describe } = require("mocha");

describe("E2E - 🎲 Game tests", () => {
    require("./game-creation.test");
    require("./full-game.test");
});