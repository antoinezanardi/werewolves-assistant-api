/* eslint-disable max-lines-per-function */
const passport = require("passport");
const { param, body } = require("express-validator");
const Game = require("../controllers/Game");
const { roleNames } = require("../helpers/Role");

module.exports = app => {

    /**
     * @apiDefine GameResponse
     * @apiSuccess {MongoId} _id Game's ID.
     * @apiSuccess {User} gameMaster User who created the game and managing it. (_See: [Models - User](#user-model)_)
     * @apiSuccess {Player} players Players of the game. (_See: [Models - Player](#player-model)_)
     * @apiSuccess {Number} turn=1 Starting at `1`, a turn starts with the first phase (the `night`) and ends with the second phase (the `day`).
     * @apiSuccess {String="day","night"} phase Each turn has two phases, `day` or `night`.
     * @apiSuccess {String} waiting.for Can be either a group, a role or the mayor. (_See: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) for possibilities_)
     * @apiSuccess {String} waiting.to What action needs to be performed by `waiting.for`. (_See: [Codes - Player Actions](#player-actions) for possibilities_)
     * @apiSuccess {String} status Game's current status. (_See: [Codes - Game Statuses](#game-statuses) for possibilities_)
     * @apiSuccess {Players[]} winners Winners of the game when status is `done`. (_See: [Models - Player](#player-model)_)
     * @apiSuccess {Date} createdAt When the game was created.
     * @apiSuccess {Date} updatedAt When the game was updated.
     */

    /**
     * @api {GET} /games A] Get all games
     * @apiName GetGames
     * @apiGroup Games 🎲
     *
     * @apiPermission Basic
     * @apiUse GameResponse
     */
    app.get("/games", passport.authenticate("basic", { session: false }), Game.getGames);

    /**
     * @api {GET} /games/repartition B] Get a game repartition
     * @apiDescription Randomly affects role to players for a game
     * @apiName GetGameRepartition
     * @apiGroup Games 🎲
     *
     * @apiParam (Request Body Parameters) {Array} players Must contain between 4 and 20 players.
     * @apiParam (Request Body Parameters) {String} players.name Player's name. Must be unique in the array.
     * @apiPermission Basic
     * @apiSuccess {Array} players
     * @apiSuccess {String} players.name Player's name.
     * @apiSuccess {String} players.role Player's role.
     */
    app.get("/games/repartition", passport.authenticate("basic", { session: false }), [
        body("players")
            .isArray().withMessage("Must be a valid array")
            .isLength({ min: 4 }).withMessage("Must contain between 4 and 20 players"),
        body("players.*.name")
            .isString().withMessage("Must be a valid string")
            .trim()
            .notEmpty().withMessage("Can't be empty"),
    ], Game.getGameRepartition);

    /**
     * @api {GET} /games/:id C] Get a game
     * @apiName GetGame
     * @apiGroup Games 🎲
     *
     * @apiPermission Basic
     * @apiUse GameResponse
     */
    app.get("/games/:id", passport.authenticate("basic", { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
    ], Game.getGame);

    /**
     * @api {POST} /games D] Create a game
     * @apiName CreateGame
     * @apiGroup Games 🎲
     *
     * @apiPermission BearerToken
     * @apiParam (Request Body Parameters) {Array} players Must contain between 4 and 20 players.
     * @apiParam (Request Body Parameters) {String} players.name Player's name. Must be unique in the array.
     * @apiParam (Request Body Parameters) {String} players.role Player's role. (_See [Codes - Player Roles](#player-roles) for possibilities_)
     * @apiUse GameResponse
     */
    app.post("/games", passport.authenticate("jwt", { session: false }), [
        body("players")
            .isArray().withMessage("Must be a valid array")
            .isLength({ min: 4 }).withMessage("Must contain between 4 and 20 players"),
        body("players.*.name")
            .isString().withMessage("Must be a valid string")
            .trim()
            .notEmpty().withMessage("Can't be empty"),
        body("players.*.role")
            .isString().withMessage("Must be a valid string")
            .isIn(roleNames).withMessage(`Must be equal to one of the following values: ${roleNames}`),
    ], Game.postGame);
};