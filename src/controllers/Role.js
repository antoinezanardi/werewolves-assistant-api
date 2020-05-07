const Role = require("../db/models/Role");
const { sendError } = require("../helpers/Error");

exports.find = async(search, projection, options = {}) => await Role.find(search, projection, options);

exports.findOne = async(search, projection, options = {}) => await Role.findOne(search, projection, options);

exports.getRoles = async(req, res) => {
    try {
        const roles = await this.find({});
        res.status(200).json(roles);
    } catch (e) {
        sendError(res, e);
    }
};