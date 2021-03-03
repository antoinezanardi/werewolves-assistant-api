const { Schema } = require("mongoose");
const PlayerSchema = require("./Player");
const AdditionalCardSchema = require("./AdditionalCard");
const { getGamePhases, getWaitingForPossibilities, getVotesResults } = require("../../helpers/functions/Game");
const { getPlayerActions } = require("../../helpers/functions/Player");
const { getSideNames } = require("../../helpers/functions/Role");

const PlaySchema = new Schema({
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
            type: [PlayerSchema],
            required: true,
        },
    },
    targets: {
        type: [
            {
                player: {
                    type: PlayerSchema,
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
                    type: PlayerSchema,
                    required: true,
                },
                for: {
                    type: PlayerSchema,
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
    card: { type: AdditionalCardSchema },
    side: {
        type: String,
        enum: getSideNames(),
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

const GameHistorySchema = new Schema({
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
        type: PlaySchema,
        required: false,
    },
    deadPlayers: {
        type: [PlayerSchema],
        default: undefined,
    },
    revealedPlayers: {
        type: [PlayerSchema],
        default: undefined,
    },
}, {
    timestamps: true,
    versionKey: false,
    collection: "gameHistory",
});

module.exports = GameHistorySchema;