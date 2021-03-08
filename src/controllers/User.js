const { flatten } = require("mongo-dot-notation");
const { sign } = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../db/models/User");
const { generateError, sendError } = require("../helpers/functions/Error");
const { checkJWTUserRights } = require("../helpers/functions/User");
const { checkRequestData } = require("../helpers/functions/Express");
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

exports.find = (search, projection, options = {}) => User.find(search, projection, options);

exports.findOne = (search, projection, options = {}) => User.findOne(search, projection, options);

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
    bcrypt.genSalt(10, (genSaltErr, salt) => {
        if (genSaltErr) {
            return reject(genSaltErr);
        }
        bcrypt.hash(body.password, salt, (hashErr, hash) => {
            if (hashErr) {
                return reject(hashErr);
            }
            body.password = hash;
            return resolve(null);
        });
    });
});

exports.postUser = async(req, res) => {
    try {
        const { body } = checkRequestData(req);
        await this.generateSaltAndHash(body);
        const newUser = await this.create(body, { toJSON: true });
        delete newUser.password;
        res.status(200).json(newUser);
    } catch (e) {
        sendError(res, e);
    }
};

exports.getFindProjection = query => {
    if (query.fields) {
        return query.fields.split(",").map(field => field.trim()).filter(field => field !== "password");
    }
    return "-password";
};

exports.getUsers = async(req, res) => {
    try {
        const { query } = checkRequestData(req);
        const projection = this.getFindProjection(query);
        const users = await this.find({}, projection);
        res.status(200).json(users);
    } catch (e) {
        sendError(res, e);
    }
};

exports.getUser = async(req, res) => {
    try {
        const { params } = checkRequestData(req);
        checkJWTUserRights(req, params.id);
        const user = await this.findOne({ _id: params.id }, "-password");
        res.status(200).json(user);
    } catch (e) {
        sendError(res, e);
    }
};

exports.login = (req, res) => {
    try {
        checkRequestData(req);
        passport.authenticate("local", { session: false }, (err, user, info) => {
            if (err || !user) {
                return res.status(401).json(generateError("BAD_CREDENTIALS", info));
            }
            req.login(user, { session: false }, loginErr => {
                if (loginErr) {
                    res.status(500).send(loginErr);
                }
                const token = sign({ userId: user._id }, Config.app.JWTSecret);
                return res.status(200).json({ token });
            });
        })(req, res);
    } catch (e) {
        sendError(res, e);
    }
};