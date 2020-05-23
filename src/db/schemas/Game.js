const { Schema } = require("mongoose");
const PlayerSchema = require("./Player");
const { gameStatuses, waitingForPossibilities, gamePhases } = require("../../helpers/constants/Game");
const { playerActions } = require("../../helpers/constants/Player");

const gameSchema = new Schema({
    gameMaster: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    players: {
        type: [PlayerSchema],
        required: true,
    },
    turn: {
        type: Number,
        default: 1,
        min: 1,
        required: true,
    },
    phase: {
        type: String,
        enum: gamePhases,
        default: "night",
        required: true,
    },
    tick: {
        type: Number,
        default: 1,
        min: 1,
        required: true,
    },
    waiting: {
        for: {
            type: String,
            enum: waitingForPossibilities,
            default: "all",
            required: true,
        },
        to: {
            type: String,
            enum: playerActions,
            default: "elect-mayor",
            required: true,
        },
    },
    status: {
        type: String,
        enum: gameStatuses,
        default: "playing",
        required: true,
    },
    winners: [PlayerSchema],
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = gameSchema;