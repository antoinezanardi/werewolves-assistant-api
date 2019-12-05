const { Schema } = require("mongoose");

const player = new Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        original: {
            type: String,
            required: true,
        },
        current: {
            type: String,
            required: true,
        },
    },
    isMayor: {
        type: Boolean,
        default: false,
    },
    isAlive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = player;