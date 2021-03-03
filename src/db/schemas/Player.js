const { Schema } = require("mongoose");
const { getRoleNames, getSideNames } = require("../../helpers/functions/Role");
const { getWaitingForPossibilities, getGamePhases } = require("../../helpers/functions/Game");
const { getPlayerAttributes, getPlayerMurderedPossibilities } = require("../../helpers/functions/Player");

const PlayerAttributeSchema = new Schema({
    name: {
        type: String,
        enum: getPlayerAttributes().map(({ name }) => name),
        required: true,
    },
    source: {
        type: String,
        enum: getWaitingForPossibilities(),
        required: true,
    },
    remainingPhases: { type: Number },
    activeAt: {
        turn: {
            type: Number,
            min: 1,
        },
        phase: {
            type: String,
            enum: getGamePhases(),
        },
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

const PlayerPowerSchema = new Schema({
    action: {
        type: String,
        required: true,
    },
    used: {
        type: Boolean,
        required: true,
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

const MurderedSchema = new Schema({
    by: {
        type: String,
        enum: getWaitingForPossibilities(),
        required: true,
    },
    of: {
        type: String,
        enum: getPlayerMurderedPossibilities().map(({ of }) => of),
        required: true,
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

const PlayerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        original: {
            type: String,
            enum: getRoleNames(),
            required: true,
        },
        current: {
            type: String,
            enum: getRoleNames(),
            required: true,
        },
        isRevealed: {
            type: Boolean,
            default: false,
        },
    },
    side: {
        original: {
            type: String,
            enum: getSideNames(),
            required: true,
        },
        current: {
            type: String,
            enum: getSideNames(),
            required: true,
        },
    },
    attributes: {
        type: [PlayerAttributeSchema],
        default: undefined,
    },
    powers: {
        type: [PlayerPowerSchema],
        default: undefined,
    },
    isAlive: {
        type: Boolean,
        default: true,
        required: true,
    },
    murdered: {
        type: MurderedSchema,
        enum: getPlayerMurderedPossibilities(),
        required: false,
    },
}, {
    timestamps: false,
    versionKey: false,
});

module.exports = PlayerSchema;