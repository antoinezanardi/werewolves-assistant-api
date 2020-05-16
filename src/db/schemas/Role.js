const { Schema } = require("mongoose");
const { roleNames, groupNames } = require("../../helpers/constants/Role");

const role = new Schema({
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
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = role;