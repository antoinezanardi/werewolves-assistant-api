const { Schema } = require("mongoose");
const Player = require("./Player");
const { gamePhases, waitingForPossibilities } = require("../../helpers/constants/Game");
const { playerActions } = require("../../helpers/constants/Player");

const playSchema = new Schema({
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
        default: undefined,
    },
    votes: {
        type: [{
            from: {
                type: Player,
                required: true,
            },
            for: {
                type: Player,
                required: true,
            },
        }],
        _id: false,
        default: undefined,
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

// const eventSchema = new Schema({
//     type: {
//         type: String,
//         required: true,
//     },
//     source: {
//         type: String,
//         enum: waitingForPossibilities,
//         required: true,
//     },
//     targets: {
//         type: [Player],
//         default: undefined,
//     },
// }, {
//     _id: false,
//     timestamps: false,
//     versionKey: false,
// });

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
    // event: {
    //     type: eventSchema,
    //     required: false,
    // },
}, {
    timestamps: true,
    versionKey: false,
    collection: "gameHistory",
});

module.exports = gameHistorySchema;