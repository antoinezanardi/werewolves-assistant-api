const { describe } = require("mocha");

describe("E2E - 🎲 Game tests", () => {
    require("./game-creation.test");
    require("./full-game.test");
    require("./tiny-game.test");
    require("./reset-game.test");
    require("./game-repartition.test");
    require("./raven-marked-dead-player-game.test");
    require("./kill-player-twice-game.test");
    require("./hunter-kills-mayor-on-day-time.test");
    require("./no-winner-game.test");
    require("./game-won-by-lovers.test");
    require("./game-options.test");
    require("./ancient-revenge-game.test");
    require("./game-with-empty-days.test");
    require("./game-won-by-pied-piper.test");
    require("./pied-piper-infected.test");
    require("./unkillable-ancient.test");
    require("./ancient-infected.test");
});