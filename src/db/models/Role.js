const mongoose = require("mongoose");
const roleSchema = require("../schemas/Role");
const roleModel = mongoose.model("roles", roleSchema);
module.exports = roleModel;