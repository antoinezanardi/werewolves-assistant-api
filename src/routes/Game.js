const passport = require("passport");
const { param, body, query } = require("express-validator");
const Game = require("../controllers/Game");
const { getPlayerRoles, getSideNames } = require("../helpers/functions/Role");
const { getPatchableGameStatuses, getWaitingForPossibilities, getGameStatuses } = require("../helpers/functions/Game");
const { getPlayerActions } = require("../helpers/functions/Player");
const { basicLimiter } = require("../helpers/constants/Route");

module.exports = app => {
    /**
     * @apiDefine GameResponse
     * @apiSuccess {MongoId} _id Game's ID.
     * @apiSuccess {User} gameMaster User who created the game and managing it. (_See: [Models - User](#user-class)_)
     * @apiSuccess {Player[]} players Players of the game. (_See: [Models - Player](#player-class)_)
     * @apiSuccess {Number} turn=1 Starting at `1`, a turn starts with the first phase (the `night`) and ends with the second phase (the `day`).
     * @apiSuccess {String="day","night"} phase Each turn has two phases, `day` or `night`.
     * @apiSuccess {Number} tick=1 Starting at `1`, tick increments each time a play is made.
     * @apiSuccess {Object[]} waiting Queue of upcoming actions.
     * @apiSuccess {String} waiting.for Can be either a group, a role or the sheriff. (_Possibilities: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles)_)
     * @apiSuccess {String} waiting.to What action needs to be performed by `waiting.for`. (Possibilities: [Codes - Player Actions](#player-actions)_)
     * @apiSuccess {String} status Game's current status. (_Possibilities: [Codes - Game Statuses](#game-statuses)_)
     * @apiSuccess {Object} options Game's options.
     * @apiSuccess {Number{>= 0 && <= 5}} options.sistersWakingUpInterval=2 Since first `night`, interval of nights when the Two Sisters are waking up. Default is `2`, meaning they wake up every other night. If set to `0`, they are waking up the first night only.
     * @apiSuccess {Number{>= 0 && <= 5}} options.brothersWakingUpInterval=2 Since first `night`, interval of nights when the Three Brothers are waking up. Default is `2`, meaning they wake up every other night. If set to `0`, they are waking up the first night only.
     * @apiSuccess {Boolean} options.isSheriffVoteDoubled=true If set to `true`, `sheriff` vote during the village's vote is doubled, otherwise, it's a regular vote.
     * @apiSuccess {Boolean} options.isSeerTalkative=true If set to `true`, the game master must say out loud what the seer saw during her night, otherwise, he must mime the seen role to the seer. Default is `true`.
     * @apiSuccess {GameHistory[]} history Game's history. (_See: [Classes - Game History](#game-history-class)_)
     * @apiSuccess {Object} [won] Winners of the game when status is `done`.
     * @apiSuccess {String={"werewolves", "villagers", null}} won.by Can be either a group or a role. (_Possibilities: `werewolves`, `villagers` or null if nobody won_)
     * @apiSuccess {Player[]} [won.players] List of player(s) who won. (_See: [Classes - Player](#player-class)_)
     * @apiSuccess {Date} createdAt When the game was created.
     * @apiSuccess {Date} updatedAt When the game was updated.
     */

    /**
     * @api {GET} /games A] Get games
     * @apiName GetGames
     * @apiGroup Games 🎲
     * @apiDescription Get games filtered by query string parameters if specified.
     * - `JWT auth`: Only games created by the user attached to token can be retrieved from this route.
     * - `Basic auth`: All games can be retrieved.
     * @apiParam (Query String Parameters) {String} [fields] Specifies which user fields to include. Each value must be separated by a `,` without space. (e.g: `field1,field2`)
     * @apiParam (Query String Parameters) {String} [status] Filter by game's status. (_Possibilities: [Codes - Game Statuses](#game-statuses)_
     * @apiPermission JWT
     * @apiPermission Basic
     * @apiUse GameResponse
     */
    app.get("/games", basicLimiter, passport.authenticate(["basic", "jwt"], { session: false }), [
        query("fields")
            .optional()
            .isString().withMessage("Must be a valid string")
            .custom(value => (/^(?:\w+)(?:,\w+)*$/u).test(value) ? Promise.resolve() : Promise.reject(new Error()))
            .withMessage("Each value must be separated by a `,` without space. (e.g: `field1,field2`)"),
        query("status")
            .optional()
            .isIn(getGameStatuses()).withMessage(`Must be equal to one of the following values: ${getGameStatuses()}`),
    ], Game.getGames);

    /**
     * @api {GET} /games/repartition B] Get a game repartition
     * @apiDescription Randomly affects role to players for a game.
     * @apiName GetGameRepartition
     * @apiGroup Games 🎲
     *
     * @apiParam (Query String Parameters) {Object[]} players Must contain between 4 and 20 players.
     * @apiParam (Query String Parameters) {String} players.name Player's name. Must be unique in the array.
     * @apiPermission Basic
     * @apiPermission JWT
     * @apiSuccess {Object[]} players
     * @apiSuccess {String} players.name Player's name.
     * @apiSuccess {String} players.role Player's role.
     */
    app.get("/games/repartition", basicLimiter, passport.authenticate(["basic", "jwt"], { session: false }), [
        query("players")
            .isArray().withMessage("Must be a valid array")
            .custom(value => value.length >= 4 && value.length <= 20 ? Promise.resolve() : Promise.reject(new Error()))
            .withMessage("Must contain between 4 and 20 players"),
        query("players.*.name")
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
     * @apiPermission JWT
     * @apiUse GameResponse
     */
    app.get("/games/:id", basicLimiter, passport.authenticate(["basic", "jwt"], { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
    ], Game.getGame);

    /**
     * @api {POST} /games E] Create a game
     * @apiName CreateGame
     * @apiGroup Games 🎲
     *
     * @apiPermission JWT
     * @apiParam (Request Body Parameters) {Object[]} players Must contain between 4 and 20 players.
     * @apiParam (Request Body Parameters) {String{>=30}} players.name Player's name. Must be unique in the array and between 1 and 30 characters long.
     * @apiParam (Request Body Parameters) {String} players.role Player's role. (_See [Codes - Player Roles](#player-roles)_)
     * @apiParam (Request Body Parameters) {Object} [options] Game's options
     * @apiParam (Request Body Parameters) {Number{>= 0 && <= 5}} [options.sistersWakingUpInterval=2] Since first `night`, interval of nights when the Two Sisters are waking up. Default is `2`, meaning they wake up every other night. If set to `0`, they are waking up the first night only.
     * @apiParam (Request Body Parameters) {Number{>= 0 && <= 5}} [options.brothersWakingUpInterval=2] Since first `night`, interval of nights when the Three Brothers are waking up. Default is `2`, meaning they wake up every other night. If set to `0`, they are waking up the first night only.
     * @apiParam (Request Body Parameters) {Boolean} [options.isSheriffVoteDoubled=true] If set to `true`, `sheriff` vote during the village's vote is doubled, otherwise, it's a regular vote.
     * @apiParam (Request Body Parameters) {Boolean} [options.isSeerTalkative=true] If set to `true`, the game master must say out loud what the seer saw during her night, otherwise, he must mime the seen role to the seer. Default is `true`.
     * @apiUse GameResponse
     */
    app.post("/games", basicLimiter, passport.authenticate("jwt", { session: false }), [
        body("players")
            .isArray().withMessage("Must be a valid array")
            .custom(value => value.length >= 4 && value.length <= 20 ? Promise.resolve() : Promise.reject(new Error()))
            .withMessage("Must contain between 4 and 20 players"),
        body("players.*.name")
            .isString().withMessage("Must be a valid string")
            .trim()
            .isLength({ min: 1, max: 30 }).withMessage("Must be between 1 and 30 characters long"),
        body("players.*.role")
            .isString().withMessage("Must be a valid string")
            .isIn(getPlayerRoles().map(({ name }) => name)).withMessage(`Must be equal to one of the following values: ${getPlayerRoles().map(({ name }) => name)}`),
        body("options.sistersWakingUpInterval")
            .optional()
            .isInt({ min: 0, max: 5 }).withMessage("Must be a valid integer between 0 and 5")
            .toInt(),
        body("options.brothersWakingUpInterval")
            .optional()
            .isInt({ min: 0, max: 5 }).withMessage("Must be a valid integer between 0 and 5")
            .toInt(),
        body("options.isSheriffVoteDoubled")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.isSeerTalkative")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
    ], Game.postGame);

    /**
     * @api {PATCH} /games/:id/reset H] Reset a game
     * @apiName ResetGame
     * @apiGroup Games 🎲
     *
     * @apiPermission JWT
     * @apiParam (Route Parameters) {ObjectId} id Game's ID.
     * @apiUse GameResponse
     */
    app.patch("/games/:id/reset", basicLimiter, passport.authenticate("jwt", { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
    ], Game.resetGame);

    /**
     * @api {PATCH} /games/:id F] Update a game
     * @apiName UpdateGame
     * @apiGroup Games 🎲
     *
     * @apiPermission JWT
     * @apiParam (Route Parameters) {ObjectId} id Game's ID.
     * @apiParam (Request Body Parameters) {String="canceled"} [status] Game master can cancel a game only if its status is set to `playing`.
     * @apiParam (Request Body Parameters) {Object} [review] Game master can attach a game review only if its status is set to `canceled` or `done`.
     * @apiParam (Request Body Parameters) {Number{>= 0 && <= 5}} review.rating Review's rating, from 0 to 5. Not required if it is already set.
     * @apiParam (Request Body Parameters) {String{>= 0 && <= 500}} [review.comment] Review's comment, from 1 to 500 characters long.
     * @apiParam (Request Body Parameters) {Boolean=false} [review.dysfunctionFound] Must be set to true if a bug or a dysfunction was found during the game.
     * @apiUse GameResponse
     */
    app.patch("/games/:id", basicLimiter, passport.authenticate("jwt", { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("status")
            .optional()
            .isIn(getPatchableGameStatuses()).withMessage(`Must be equal to one of the following values: ${getPatchableGameStatuses()}`),
        body("review.rating")
            .optional()
            .isFloat({ min: 0, max: 5 }).withMessage("Must be a valid float")
            .toFloat(),
        body("review.comment")
            .optional()
            .isString().withMessage("Must be a valid string")
            .trim()
            .isLength({ min: 1, max: 500 }).withMessage("Must be between 1 and 500 characters long"),
        body("review.dysfunctionFound")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
    ], Game.patchGame);

    /**
     * @api {POST} /games/:id/play G] Make a play
     * @apiName MakeAPlayInGame
     * @apiGroup Games 🎲
     *
     * @apiPermission JWT
     * @apiParam (Route Parameters) {ObjectId} id Game's ID.
     * @apiParam (Request Body Parameters) {String} source Source of the play. (_Possibilities: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) or `sheriff`_).
     * @apiParam (Request Body Parameters) {String} action Action of the play. (_Possibilities: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) or `sheriff`_).
     * @apiParam (Request Body Parameters) {Object[]} [targets] Player(s) affected by the play. Required when **action** is `use-potion`, `eat`, `look`, `protect`, `shoot`, `mark`, `delegate` or `settle-votes`.
     * @apiParam (Request Body Parameters) {ObjectId} targets.player Player's id.
     * @apiParam (Request Body Parameters) {Object} [targets.potion] Only for the `witch` actions.
     * @apiParam (Request Body Parameters) {Boolean} [targets.potion.life] Set to `true` if the `witch` saves target's life from werewolves meal.
     * @apiParam (Request Body Parameters) {Boolean} [targets.potion.death] Set to `true` if the `witch` kills the target.
     * @apiParam (Request Body Parameters) {Object[]} [votes] Required when **action** is `elect-sheriff` or `vote`.
     * @apiParam (Request Body Parameters) {ObjectId} votes.from Vote's source.
     * @apiParam (Request Body Parameters) {ObjectId} votes.for Vote's target.
     * @apiParam (Request Body Parameters) {String={"villagers","werewolves"}} [side] Side chosen by the dog-wolf. Required when **action** is `choose-side`.
     * @apiUse GameResponse
     */
    app.post("/games/:id/play", basicLimiter, passport.authenticate("jwt", { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("source")
            .isIn(getWaitingForPossibilities()).withMessage(`Must be equal to one of the following values: ${getWaitingForPossibilities()}`),
        body("action")
            .isIn(getPlayerActions()).withMessage(`Must be equal to one of the following values: ${getPlayerActions()}`),
        body("targets")
            .optional()
            .isArray().withMessage("Must be an array"),
        body("targets.*.player")
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("targets.*.potion.life")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("targets.*.potion.death")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("votes")
            .optional()
            .isArray().withMessage("Must be an array"),
        body("votes.*.from")
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("votes.*.for")
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("side")
            .optional()
            .isString().withMessage("Must be a valid string")
            .isIn(getSideNames()).withMessage(`Must be equal to one of the following values: ${getSideNames()}`),
    ], Game.postPlay);
};