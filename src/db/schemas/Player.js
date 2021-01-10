const { Schema } = require("mongoose");
const { playerAttributes, playerActions, murderedPossibilities } = require("../../helpers/constants/Player");
const { getRoleNames, getSideNames } = require("../../helpers/functions/Role");
const { getWaitingForPossibilities } = require("../../helpers/functions/Game");

const PlayerAttributeSchema = new Schema({
    attribute: {
        type: String,
        enum: playerAttributes.map(playerAttribute => playerAttribute.attribute),
        required: true,
    },
    source: {
        type: String,
        enum: getWaitingForPossibilities(),
        required: true,
    },
    remainingPhases: { type: Number },
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
        enum: playerActions,
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
        enum: murderedPossibilities,
        required: false,
    },
}, {
    timestamps: false,
    versionKey: false,
});

module.exports = PlayerSchema;