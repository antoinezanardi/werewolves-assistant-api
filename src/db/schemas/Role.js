const { Schema } = require("mongoose");
const { roleNames, groupNames } = require("../../helpers/constants/Role");
const { playerActions } = require("../../helpers/constants/Player");

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        enum: roleNames,
    },
    group: {
        type: String,
        required: true,
        enum: groupNames,
    },
    maxInGame: {
        type: Number,
        required: true,
    },
    powers: [{
        type: String,
        enum: playerActions,
        required: true,
    }],
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = roleSchema;