const { Schema } = require("mongoose");
const Player = require("./Player");
const { gamePhases, waitingForPossibilities } = require("../../helpers/constants/Game");
const { playerActions } = require("../../helpers/constants/Player");

const play = {
    action: {
        type: String,
        enum: playerActions,
        required: true,
    },
    source: {
        type: String,
        enum: waitingForPossibilities,
        required: true,
    },
    targets: {
        type: [Player],
    },
};

const gameHistory = new Schema({
    gameId: {
        type: Schema.Types.ObjectId,
        ref: "games",
        required: true,
    },
    turn: {
        type: Number,
        min: 1,
        required: true,
    },
    phase: {
        type: String,
        enum: gamePhases,
        required: true,
    },
    tick: {
        type: Number,
        min: 1,
        required: true,
    },
    play,
    // TODO: event structure
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = gameHistory;