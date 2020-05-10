const { flatten } = require("mongo-dot-notation");
const { sign } = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../db/models/User");
const { generateError, sendError } = require("../helpers/Error");
const { checkRouteParameters } = require("../helpers/Express");
const Config = require("../../config");

exports.create = async(data, options = {}) => {
    const { toJSON } = options;
    delete options.toJSON;
    if (!Array.isArray(data)) {
        options = null;
    }
    const user = await User.create(data, options);
    return toJSON ? user.toObject() : user;
};

exports.find = async(search, projection, options = {}) => await User.find(search, projection, options);

exports.findOne = async(search, projection, options = {}) => await User.findOne(search, projection, options);

exports.findOneAndUpdate = async(search, data, options = {}) => {
    const { toJSON } = options;
    delete options.toJSON;
    options.new = options.new === undefined ? true : options.new;
    const user = await this.findOne(search);
    if (!user) {
        throw generateError("NOT_FOUND", `User not found`);
    }
    const updatedUser = await User.findOneAndUpdate(search, flatten(data), options);
    return toJSON ? updatedUser.toJSON() : updatedUser;
};

exports.generateSaltAndHash = body => new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return reject(err);
        } else {
            bcrypt.hash(body.password, salt, (err, hash) => {
                if (err) {
                    return reject(err);
                } else {
                    body.password = hash;
                    return resolve(null);
                }
            });
        }
    });
});

exports.postUser = async(req, res) => {
    try {
        const { body } = checkRouteParameters(req);
        await this.generateSaltAndHash(body);
        const newUser = await this.create(body, { lean: true });
        delete newUser.password;
        res.status(200).json(newUser);
    } catch (e) {
        sendError(res, e);
    }
};

exports.getUsers = async(req, res) => {
    try {
        const users = await this.find({}, "-password");
        res.status(200).json(users);
    } catch (e) {
        sendError(res, e);
    }
};

exports.login = (req, res) => {
    try {
        checkRouteParameters(req);
        passport.authenticate("local", { session: false }, (err, user, info) => {
            if (err || !user) {
                return res.status(401).json(generateError("BAD_CREDENTIALS", info));
            }
            req.login(user, { session: false }, err => {
                if (err) {
                    res.status(500).send(err);
                }
                const token = sign({ userId: user._id, exp: Math.floor(Date.now() / 1000) + 3600 * 24 }, Config.app.JWTSecret);
                return res.status(200).json({ token });
            });
        })(req, res);
    } catch (e) {
        sendError(res, e);
    }
};