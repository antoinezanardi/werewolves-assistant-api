/* eslint-disable max-lines-per-function */
const passport = require("passport");
const { param, body } = require("express-validator");
const Game = require("../controllers/Game");
const { roleNames } = require("../helpers/constants/Role");
const { patchableGameStatuses, waitingForPossibilities } = require("../helpers/constants/Game");
const { playerActions } = require("../helpers/constants/Player");

module.exports = app => {

    /**
     * @apiDefine GameResponse
     * @apiSuccess {MongoId} _id Game's ID.
     * @apiSuccess {User} gameMaster User who created the game and managing it. (_See: [Models - User](#user-class)_)
     * @apiSuccess {Player} players Players of the game. (_See: [Models - Player](#player-class)_)
     * @apiSuccess {Number} turn=1 Starting at `1`, a turn starts with the first phase (the `night`) and ends with the second phase (the `day`).
     * @apiSuccess {String="day","night"} phase Each turn has two phases, `day` or `night`.
     * @apiSuccess {Number} tick=1 Starting at `1`, tick increments each time a play is made.
     * @apiSuccess {Object} waiting
     * @apiSuccess {String} waiting.for Can be either a group, a role or the mayor. (_See: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles)_)
     * @apiSuccess {String} waiting.to What action needs to be performed by `waiting.for`. (_See: [Codes - Player Actions](#player-actions)_)
     * @apiSuccess {String} status Game's current status. (_See: [Codes - Game Statuses](#game-statuses)_)
     * @apiSuccess {Players[]} [winners] Winners of the game when status is `done`. (_See: [Models - Player](#player-class)_)
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
            .custom(value => value.length >= 4 && value.length <= 20 ? Promise.resolve() : Promise.reject())
            .withMessage("Must contain between 4 and 20 players"),
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
     * @apiParam (Route Parameters) {ObjectId} id Game's ID.
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
     * @apiParam (Request Body Parameters) {String} players.role Player's role. (_See [Codes - Player Roles](#player-roles)_)
     * @apiUse GameResponse
     */
    app.post("/games", passport.authenticate("jwt", { session: false }), [
        body("players")
            .isArray().withMessage("Must be a valid array")
            .custom(value => value.length >= 4 && value.length <= 20 ? Promise.resolve() : Promise.reject())
            .withMessage("Must contain between 4 and 20 players"),
        body("players.*.name")
            .isString().withMessage("Must be a valid string")
            .trim()
            .notEmpty().withMessage("Can't be empty"),
        body("players.*.role")
            .isString().withMessage("Must be a valid string")
            .isIn(roleNames).withMessage(`Must be equal to one of the following values: ${roleNames}`),
    ], Game.postGame);

    /**
     * @api {PATCH} /games/:id E] Update a game
     * @apiName UpdateGame
     * @apiGroup Games 🎲
     *
     * @apiPermission BearerToken
     * @apiParam (Route Parameters) {ObjectId} id Game's ID.
     * @apiParam (Request Body Parameters) {String="canceled"} [status] Game master can cancel a game only if its status is set to `playing`.
     * @apiUse GameResponse
     */
    app.patch("/games/:id", passport.authenticate("jwt", { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("status")
            .isIn(patchableGameStatuses).withMessage(`Must be equal to one of the following values: ${patchableGameStatuses}`)
            .optional(),
    ], Game.patchGame);

    /**
     * @api {POST} /games/:id/play F] Make a play
     * @apiName MakeAPlayInGame
     * @apiGroup Games 🎲
     *
     * @apiPermission BearerToken
     * @apiParam (Route Parameters) {ObjectId} id Game's ID.
     * @apiParam (Request Body Parameters) {String} source Source of the play. (_Possibilities: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) or `mayor`_).
     * @apiParam (Request Body Parameters) {String} action Action of the play. (_Possibilities: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) or `mayor`_).
     * @apiParam (Request Body Parameters) {Array} [targets] Player(s) affected by the play. Required when **action** is `use-potion`, `look`, `protect`, `shoot`, `mark`, `delegate` or `settle-votes`.
     * @apiParam (Request Body Parameters) {ObjectId} targets._id Player's id.
     * @apiParam (Request Body Parameters) {Object} [targets.potion]
     * @apiParam (Request Body Parameters) {Boolean} [targets.potion.life] Set to `true` if the `witch` saves target's life.
     * @apiParam (Request Body Parameters) {Boolean} [targets.potion.death] Set to `true` if the `witch` kills the target.
     * @apiParam (Request Body Parameters) {Array} [votes] Required when **action** is `elect-mayor`, `eat` or `vote`.
     * @apiParam (Request Body Parameters) {ObjectId} votes.from Vote's source.
     * @apiParam (Request Body Parameters) {ObjectId} votes.for Vote's target.
     * @apiUse GameResponse
     */
    app.post("/games/:id/play", passport.authenticate("jwt", { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("source")
            .isIn(waitingForPossibilities).withMessage(`Must be equal to one of the following values: ${waitingForPossibilities}`),
        body("action")
            .isIn(playerActions).withMessage(`Must be equal to one of the following values: ${playerActions}`),
        body("targets")
            .optional()
            .isArray().withMessage("Must be an array"),
        body("targets.*._id")
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("votes")
            .optional()
            .isArray().withMessage("Must be an array")
            .custom(value => value.length ? Promise.resolve() : Promise.reject()).withMessage("Array can't be empty"),
        body("votes.*.from")
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("votes.*.for")
            .isMongoId().withMessage("Must be a valid MongoId"),
    ], Game.postPlay);
};