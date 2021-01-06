const { Schema } = require("mongoose");
const Player = require("./Player");
const { gamePhases, waitingForPossibilities } = require("../../helpers/constants/Game");
const { playerActions } = require("../../helpers/constants/Player");
const { getSideNames } = require("../../helpers/functions/Role");

const playSchema = new Schema({
    action: {
        type: String,
        enum: playerActions,
        required: true,
    },
    source: {
        name: {
            type: String,
            enum: waitingForPossibilities,
            required: true,
        },
        players: {
            type: [Player],
            required: true,
        },
    },
    targets: {
        type: [
            {
                player: {
                    type: Player,
                    required: true,
                },
                potion: {
                    life: { type: Boolean },
                    death: { type: Boolean },
                },
            },
        ],
        _id: false,
        default: undefined,
    },
    votes: {
        type: [
            {
                from: {
                    type: Player,
                    required: true,
                },
                for: {
                    type: Player,
                    required: true,
                },
            },
        ],
        _id: false,
        default: undefined,
    },
    side: {
        type: String,
        enum: getSideNames(),
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

const gameHistorySchema = new Schema({
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
    play: {
        type: playSchema,
        required: false,
    },
    dead: {
        type: [Player],
        default: undefined,
    },
}, {
    timestamps: true,
    versionKey: false,
    collection: "gameHistory",
});

module.exports = gameHistorySchema;