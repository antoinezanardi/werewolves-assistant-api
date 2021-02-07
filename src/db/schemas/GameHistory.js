const { Schema } = require("mongoose");
const Player = require("./Player");
const { getGamePhases, getWaitingForPossibilities, getVotesResults } = require("../../helpers/functions/Game");
const { getPlayerActions } = require("../../helpers/functions/Player");
const { getSideNames } = require("../../helpers/functions/Role");

const playSchema = new Schema({
    action: {
        type: String,
        enum: getPlayerActions(),
        required: true,
    },
    source: {
        name: {
            type: String,
            enum: getWaitingForPossibilities(),
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
                hasDrankLifePotion: { type: Boolean },
                hasDrankDeathPotion: { type: Boolean },
                isInfected: { type: Boolean },
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
    votesResult: {
        type: String,
        enum: getVotesResults(),
    },
    doesJudgeRequestAnotherVote: { type: Boolean },
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
        enum: getGamePhases(),
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
    deadPlayers: {
        type: [Player],
        default: undefined,
    },
    revealedPlayers: {
        type: [Player],
        default: undefined,
    },
}, {
    timestamps: true,
    versionKey: false,
    collection: "gameHistory",
});

module.exports = gameHistorySchema;