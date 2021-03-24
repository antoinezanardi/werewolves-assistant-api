const { Schema } = require("mongoose");
const { getRegistrationMethods } = require("../../helpers/functions/User");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: { type: String },
    registration: {
        method: {
            type: String,
            enum: getRegistrationMethods(),
            default: "local",
        },
    },
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = userSchema;