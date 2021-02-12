const { Schema } = require("mongoose");
const { getRoleNames } = require("../../helpers/functions/Role");
const { getAdditionalCardsForRoleNames } = require("../../helpers/functions/Game");

const AdditionalCardSchema = new Schema({
    role: {
        type: String,
        enum: getRoleNames(),
        required: true,
    },
    for: {
        type: String,
        enum: getAdditionalCardsForRoleNames(),
        required: true,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: false,
    versionKey: false,
});

module.exports = AdditionalCardSchema;