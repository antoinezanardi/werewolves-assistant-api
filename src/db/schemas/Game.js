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
        default: undefined,
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

const ReviewSchema = new Schema({
    rating: {
        type: Number,
        required: true,
    },
    comment: { type: String },
    dysfunctionFound: {
        type: Boolean,
        default: false,
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

const WaitingSchema = new Schema({
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
}, {
    _id: false,
    timestamps: false,
    versionKey: undefined,
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
        type: [WaitingSchema],
        _id: false,
        default: undefined,
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
    review: {
        type: ReviewSchema,
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