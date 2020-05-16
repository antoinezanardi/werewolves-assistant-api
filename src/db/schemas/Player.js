const { Schema } = require("mongoose");
const { playerAttributes, playerActions } = require("../../helpers/constants/Player");
const { groupNames, roleNames } = require("../../helpers/constants/Role");

const player = new Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        original: {
            type: String,
            enum: roleNames,
            required: true,
        },
        current: {
            type: String,
            enum: roleNames,
            required: true,
        },
        group: {
            type: String,
            enum: groupNames,
            required: true,
        },
    },
    attributes: [{
        attribute: {
            type: String,
            enum: playerAttributes,
            required: true,
        },
        source: {
            type: String,
            enum: [...roleNames, ...groupNames],
            required: true,
        },
        remaining: {
            type: String,
        },
    }],
    isAlive: {
        type: Boolean,
        default: true,
        required: true,
    },
    murdered: {
        by: {
            type: String,
            enum: [...roleNames, ...groupNames],
        },
        of: {
            type: String,
            enum: playerActions,
        },
    },
}, {
    timestamps: false,
    versionKey: false,
});

module.exports = player;