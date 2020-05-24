const { Schema } = require("mongoose");
const PlayerSchema = require("./Player");
const { gameStatuses, waitingForPossibilities, gamePhases, wonByPossibilities } = require("../../helpers/constants/Game");
const { playerActions } = require("../../helpers/constants/Player");

const WonSchema = new Schema({
    by: {
        type: String,
        enum: wonByPossibilities,
        required: true,
    },
    players: {
        type: [PlayerSchema],
        required: true,
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

const GameSchema = new Schema({
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
    won: {
        type: WonSchema,
        required: false,
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    id: false,
});

GameSchema.virtual("history", {
    ref: "gameHistory",
    localField: "_id",
    foreignField: "gameId",
    justOne: false,
    options: { sort: { createdAt: -1 } },
});

module.exports = GameSchema;