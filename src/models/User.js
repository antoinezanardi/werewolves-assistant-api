const mongoose = require("mongoose");
const userSchema = require("../schemas/User");
const userModel = mongoose.model("users", userSchema);
module.exports = userModel;