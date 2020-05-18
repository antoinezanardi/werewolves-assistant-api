const { Schema } = require("mongoose");
const Player = require("./Player");
const { gamePhases, waitingForPossibilities } = require("../../helpers/constants/Game");
const { playerActions } = require("../../helpers/constants/Player");

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
    source: {
        type: String,
        enum: waitingForPossibilities,
        required: true,
    },
    action: {
        type: String,
        enum: playerActions,
        required: true,
    },
    targets: {
        type: [Player],
    },
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = gameHistory;