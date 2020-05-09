const { Schema } = require("mongoose");
const PlayerSchema = require("./Player");
const { gameStatuses, waitingForPossibilities, gamePhases } = require("../../helpers/Game");
const { playerActions } = require("../../helpers/Player");

const game = new Schema({
    gameMaster: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    players: [PlayerSchema],
    turn: {
        type: Number,
        default: 1,
    },
    phase: {
        type: String,
        enum: gamePhases,
        default: "night",
    },
    waiting: {
        for: {
            type: String,
            enum: waitingForPossibilities,
            required: true,
        },
        to: {
            type: String,
            enum: playerActions,
            required: true,
        },
    },
    status: {
        type: String,
        enum: gameStatuses,
        default: "assigning-roles",
    },
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = game;