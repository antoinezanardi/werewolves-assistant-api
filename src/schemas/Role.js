const { Schema } = require("mongoose");

const role = new Schema({
    name: {
        type: String,
        required: true,
    },
    group: {
        type: String,
        enum: ,
    },
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = role;