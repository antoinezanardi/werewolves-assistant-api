const { Schema } = require("mongoose");
const { playerAttributes } = require("../../helpers/Player");
const { groupNames, roleNames } = require("../../helpers/Role");

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
    isAlive: {
        type: Boolean,
        default: true,
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
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = player;