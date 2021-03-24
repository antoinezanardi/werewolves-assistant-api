const axios = require("axios");
const { flatten } = require("mongo-dot-notation");
const { sign } = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../db/models/User");
const { generateError, sendError } = require("../helpers/functions/Error");
const { checkJWTUserRights } = require("../helpers/functions/User");
const { checkRequestData } = require("../helpers/functions/Express");
const Config = require("../../config");

exports.checkDataBeforeCreate = async data => {
    const existingUser = await this.findOne({ email: data.email });
    if (existingUser) {
        if (existingUser.registration.method === data.registration.method) {
            throw generateError("EMAIL_EXISTS", "The email provided already exists.");
        }
        if (existingUser.registration.method === "local") {
            throw generateError("EMAIL_EXISTS_WITH_LOCAL_REGISTRATION", "The email provided already exists with local registration.");
        } else if (existingUser.registration.method === "facebook") {
            throw generateError("EMAIL_EXISTS_WITH_FACEBOOK_REGISTRATION", "The email provided already exists with facebook registration.");
        } else if (existingUser.registration.method === "google") {
            throw generateError("EMAIL_EXISTS_WITH_GOOGLE_REGISTRATION", "The email provided already exists with google registration.");
        }
    }
};

exports.create = async(data, options = {}) => {
    await this.checkDataBeforeCreate(data);
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
        body.registration = { method: "local" };
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

exports.getJWT = user => sign({ userId: user._id }, Config.app.JWTSecret);

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
                const token = this.getJWT(user);
                return res.status(200).json({ token });
            });
        })(req, res);
    } catch (e) {
        sendError(res, e);
    }
};

exports.getFacebookUser = async accessToken => {
    try {
        const { data } = await axios.get(`https://graph.facebook.com/me?fields=email&access_token=${accessToken}`);
        return data;
    } catch (e) {
        throw generateError("BAD_FACEBOOK_ACCESS_TOKEN", `Access token "${accessToken}" doesn't allow to get user info.`);
    }
};

exports.loginWithFacebook = async(req, res) => {
    try {
        const { body } = checkRequestData(req);
        const facebookUser = await this.getFacebookUser(body.accessToken);
        if (!facebookUser.email) {
            throw generateError("NEED_FACEBOOK_EMAIL_PERMISSION", `You need to share your email to login with Facebook.`);
        }
        const facebookUserData = { email: facebookUser.email, registration: { method: "facebook" } };
        let user = await this.findOne(facebookUserData);
        if (!user) {
            user = await this.create(facebookUserData);
        }
        const token = this.getJWT(user);
        res.status(200).json({ token });
    } catch (e) {
        sendError(res, e);
    }
};