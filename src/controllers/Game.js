const { flatten } = require("mongo-dot-notation");
const Game = require("../models/Game");
const { generateError, sendError } = require("../helpers/Error");
const { checkRouteParameters } = require("../helpers/Express");

exports.create = async(data, options = {}) => {
    const { lean } = options;
    if (!Array.isArray(data)) {
        options = null;
    }
    const game = await Game.create(data, options);
    return lean ? game.toObject() : game;
};

exports.find = async(search, projection, options = {}) => await Game.find(search, projection, options);

exports.findOne = async(search, projection, options = {}) => await Game.findOne(search, projection, options);

exports.findOneAndUpdate = async(search, data, options = {}) => {
    options.new = options.new === undefined ? true : options.new;
    const game = await this.findOne(search);
    if (!game) {
        throw generateError("NOT_FOUND", `Game not found`);
    }
    return await Game.findOneAndUpdate(search, flatten(data), options);
};

exports.getGames = async(req, res) => {
    try {
        checkRouteParameters(req);
        const games = await this.find({});
        res.status(200).json(games);
    } catch (e) {
        sendError(res, e);
    }
};

exports.getGameRepartition = async(req, res) => {
    try {
        const { body } = checkRouteParameters(req);
        
        res.status(200).json(body);
    } catch (e) {
        sendError(res, e);
    }
};

exports.getGame = async(req, res) => {
    try {
        const { params } = checkRouteParameters(req);
        const game = await this.findOne({ _id: params.id });
        if (!game) {
            throw generateError("NOT_FOUND", `Game not found with id "${params.id}"`);
        }
        res.status(200).json(game);
    } catch (e) {
        sendError(res, e);
    }
};