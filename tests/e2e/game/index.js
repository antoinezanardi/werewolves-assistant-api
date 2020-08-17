const { describe } = require("mocha");

describe("E2E - 🎲 Game tests", () => {
    require("./game-creation.test");
    require("./full-game.test");
    require("./tiny-game.test");
    require("./reset-game.test");
    require("./game-repartition.test");
    require("./raven-marked-dead-player-game.test");
    require("./kill-player-twice-game.test");
});