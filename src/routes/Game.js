/* eslint-disable max-lines-per-function */
const passport = require("passport");
const { param, body } = require("express-validator");
const Game = require("../controllers/Game");

module.exports = app => {

    /**
     * @apiDefine BearerToken Bearer Authorization with User Token
     */

    /**
     * @apiDefine UserRequestBody
     * @apiParam (Request Body Parameters) {String} email User's email.
     * @apiParam (Request Body Parameters) {String{>=5}} password User's password.
     */

    /**
     * @apiDefine GameResponse
     * @apiSuccess {MongoId} _id Game's ID.
     * @apiSuccess {Date} createdAt When the game was created.
     * @apiSuccess {Date} updatedAt When the game was updated.
     */

    /**
     * @api {GET} /games Get all games
     * @apiName GetGames
     * @apiGroup Game
     *
     * @apiPermission Basic
     * @apiUse GameResponse
     */
    app.get("/games", passport.authenticate("basic", { session: false }), Game.getGames);

    /**
     * @api {GET} /games/repartition Get a game repartition
     * @apiDescription Randomly affects role to players for a game
     * @apiName GetGameRepartition
     * @apiGroup Game
     *
     * @apiParam (Request Body Parameters) {Array} players Must has at least 4 players.
     * @apiParam (Request Body Parameters) {String} players.name Player's name.
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
     * @api {GET} /games/:id Get a game
     * @apiName GetGame
     * @apiGroup Game
     *
     * @apiPermission Basic
     * @apiUse GameResponse
     */
    app.get("/games/:id", passport.authenticate("basic", { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
    ], Game.getGame);
};