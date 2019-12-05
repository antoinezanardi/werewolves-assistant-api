const { Schema } = require("mongoose");
const PlayerSchema = require("./Player");

const game = new Schema({
    gameMaster: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    players: [PlayerSchema],
    turn: {
        type: Number,
        default: 1,
    },
    phase: {
        type: String,
        default: "night",
    },
    waiting: {
        role: {
            type: String,
            required: true,
        },
        to: {
            type: String,
            required: true,
        },
    },
    status: {
        type: String,
        default: "distributing-roles",
    },
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = game;