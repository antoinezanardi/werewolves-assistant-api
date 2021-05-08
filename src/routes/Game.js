const passport = require("passport");
const { param, body, query } = require("express-validator");
const Game = require("../controllers/Game");
const GameHistory = require("../controllers/GameHistory");
const { getRoleNames, getSideNames } = require("../helpers/functions/Role");
const {
    getPatchableGameStatuses, getWaitingForPossibilities, getGameStatuses, getGamePhases,
    getGameRepartitionForbiddenRoleNames, getAdditionalCardsForRoleNames,
} = require("../helpers/functions/Game");
const { getPlayerActions } = require("../helpers/functions/Player");
const { basicLimiter } = require("../helpers/constants/Route");

module.exports = app => {
    /**
     * @apiDefine GameResponse
     * @apiSuccess {MongoId} _id Game's ID.
     * @apiSuccess {User} gameMaster User who created the game and managing it. (_See: [Classes - User](#user-class)_)
     * @apiSuccess {Player[]} players Players of the game. (_See: [Classes - Player](#player-class)_)
     * @apiSuccess {Number} turn=1 Starting at `1`, a turn starts with the first phase (the `night`) and ends with the second phase (the `day`).
     * @apiSuccess {String="day","night"} phase Each turn has two phases, `day` or `night`.
     * @apiSuccess {Number} tick=1 Starting at `1`, tick increments each time a play is made.
     * @apiSuccess {Object[]} [waiting] Queue of upcoming actions.
     * @apiSuccess {String} waiting.for Can be either a group, a role or the sheriff. (_Possibilities: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles)_)
     * @apiSuccess {String} waiting.to What action needs to be performed by `waiting.for`. (Possibilities: [Codes - Player Actions](#player-actions)_)
     * @apiSuccess {String} [waiting.cause] The cause of action. (_Possibilities: `stuttering-judge-request`_)
     * @apiSuccess {String} status Game's current status. (_Possibilities: [Codes - Game Statuses](#game-statuses)_)
     * @apiSuccess {AdditionalCard[]} [additionalCards] Game's additional cards. Set if `thief` is in the game. (_See: [Classes - Additional Card](#game-additional-card-class)_)
     * @apiSuccess {Object} options Game's options.
     * @apiSuccess {Object} options.repartition Game role's repartition.
     * @apiSuccess {Boolean} options.repartition.isHidden=false If set to `true`, game's repartition will be hidden to all players. Default is false.
     * @apiSuccess {Object} options.roles Game roles options.
     * @apiSuccess {Boolean} options.roles.areRevealedOnDeath=true If set to `true`, player's role is revealed when he's dead. Default is `true`.
     * @apiSuccess {Object} options.roles.sheriff Game sheriff role's options.
     * @apiSuccess {Boolean} options.roles.sheriff.isEnabled=true If set to `true`, `sheriff` will be elected the first tick and the responsibility will be delegated when he dies. Otherwise, there will be no sheriff in the game and tie in votes will result in another vote between the tied players. In case of another equality, there will be no vote.
     * @apiSuccess {Object} options.roles.sheriff.electedAt When the sheriff is elected during the game.
     * @apiSuccess {Number} options.roles.sheriff.electedAt.turn=1 Game's turn when the sheriff is elected. Default is `1`.
     * @apiSuccess {String} options.roles.sheriff.electedAt.phase="night" Game's phase when the sheriff is elected. Default is `night`.
     * @apiSuccess {Boolean} options.roles.sheriff.hasDoubledVote=true If set to `true`, `sheriff` vote during the village's vote is doubled, otherwise, it's a regular vote.
     * @apiSuccess {Boolean} options.roles.sheriff.canSettleVotes=true If set to `true`, `sheriff` can settle votes if there is a tie in votes and no alive and powerful `scapegoat`. Default is `true`.
     * @apiSuccess {Object} options.roles.lovers Game lovers options.
     * @apiSuccess {Boolean} options.roles.lovers.doRevealRoleToEachOther If set to `true`, `lovers` reveal their role to each other when they wake up the first night. Default is `false`.
     * @apiSuccess {Object} options.roles.bigBadWolf Game big bad wolf role's options.
     * @apiSuccess {Boolean} options.roles.bigBadWolf.isPowerlessIfWerewolfDies=true If set to `true`, `big-bad-wolf` won't wake up anymore during the night if at least one player from the `werewolves` side died. Default is `true`.
     * @apiSuccess {Object} options.roles.whiteWerewolf Game white werewolf role's options.
     * @apiSuccess {Number{>= 1 && <= 5}} options.roles.whiteWerewolf.wakingUpInterval=2 Since first `night`, interval of nights when the `white-werewolf` is waking up. Default is `2`, meaning he wakes up every other night.
     * @apiSuccess {Object} options.roles.seer Game seer role's options.
     * @apiSuccess {Boolean} options.roles.seer.isTalkative=true If set to `true`, the game master must say out loud what the seer saw during her night, otherwise, he must mime the seen role to the seer. Default is `true`.
     * @apiSuccess {Boolean} options.roles.seer.canSeeRoles=true If set to `true`, the seer can the exact `role` of the target, otherwise, she only sees the `side`. Default is `true`.
     * @apiSuccess {Object} options.roles.cupid Game cupid role's options.
     * @apiSuccess {Boolean} options.roles.cupid.mustWinWithLovers=false If set to `true`, the cupid teams up with the `lovers` and can't target himself when charming. Default is `false`.
     * @apiSuccess {Object} options.roles.littleGirl Game little girl role's options.
     * @apiSuccess {Boolean} options.roles.littleGirl.isProtectedByGuard=false If set to `false`, the little girl won't be protected by the guard from the werewolves attacks. Default is `false`.
     * @apiSuccess {Object} options.roles.guard Game guard role's options.
     * @apiSuccess {Boolean} options.roles.guard.canProtectTwice=false If set to `true`, the guard can protect twice in a row the same target. Default is `false`.
     * @apiSuccess {Object} options.roles.ancient Game ancient role's options.
     * @apiSuccess {Number{>= 1 && <= 5}} options.roles.ancient.livesCountAgainstWerewolves=2 Number of lives ancient has against `werewolves`. Default is `2`.
     * @apiSuccess {Boolean} options.roles.ancient.doesTakeHisRevenge=true If set to `true`, the `ancient` will make all players from the `villagers` side `powerless` if he dies from them. Default is `true`.
     * @apiSuccess {Object} options.roles.idiot Game idiot role's options.
     * @apiSuccess {Boolean} options.roles.idiot.doesDieOnAncientDeath=true If set to `true`, the idiot will die if he is revealed and the ancient is dead. Default is `true`.
     * @apiSuccess {Object} options.roles.twoSisters Game two sisters role's options.
     * @apiSuccess {Number{>= 0 && <= 5}} options.roles.twoSisters.wakingUpInterval=2 Since first `night`, interval of nights when the Two Sisters are waking up. Default is `2`, meaning they wake up every other night. If set to `0`, they are waking up the first night only.
     * @apiSuccess {Object} options.roles.threeBrothers Game three brothers role's options.
     * @apiSuccess {Number{>= 0 && <= 5}} options.roles.threeBrothers.wakingUpInterval=2 Since first `night`, interval of nights when the Three Brothers are waking up. Default is `2`, meaning they wake up every other night. If set to `0`, they are waking up the first night only.
     * @apiSuccess {Object} options.roles.fox Game fox role's options.
     * @apiSuccess {Boolean} options.roles.fox.isPowerlessIfMissesWerewolf=true If set to `true`, the fox will loose his power if he doesn't find a player from the `werewolves` side during his turn if he doesn't skip. Default is `true`.
     * @apiSuccess {Object} options.roles.bearTamer Game bear tamer role's options.
     * @apiSuccess {Boolean} options.roles.bearTamer.doesGrowlIfInfected=true If set to `true`, the bear tamer will have the `growls` attribute until he dies if he is `infected`. Default is `true`.
     * @apiSuccess {Object} options.roles.stutteringJudge Game stuttering judge role's options.
     * @apiSuccess {Number{>= 1 && <= 5}} options.roles.stutteringJudge.voteRequestsCount=1 Number of vote requests that the `stuttering-judge` can make during the game. Default is `1`.
     * @apiSuccess {Object} options.roles.wildChild Game wild child role's options.
     * @apiSuccess {Boolean} options.roles.wildChild.isTransformationRevealed=false If set to `true`, when `wild-child` joins the `werewolves` side because his model died, the game master will announce his transformation to other players. Default is `false`.
     * @apiSuccess {Object} options.roles.dogWolf Game dog wolf role's options.
     * @apiSuccess {Boolean} options.roles.dogWolf.isChosenSideRevealed=false If set to `true`, when `dog-wolf` chooses his side at the beginning of the game, the game master will announce the chosen side to other players. Default is `false`.
     * @apiSuccess {Boolean} options.roles.dogWolf.isChosenSideRandom=false If set to `true`, the chosen side for the `dog-wolf` will be randomly defined by the API. Default is `false`.
     * @apiSuccess {Object} options.roles.thief Game thief role's options.
     * @apiSuccess {Boolean} options.roles.thief.isChosenCardRevealed=true If set to `true`, when `thief` chooses a card or skips, game master must tell the `thief` choice. Default is `false`.
     * @apiSuccess {Boolean} options.roles.thief.mustChooseBetweenWerewolves=true If set to `true`, if all `thief` additional cards are from the `werewolves` side, he can't skip and must choose one. Default is `true`.
     * @apiSuccess {Number{>= 1 && <= 5}} options.roles.thief.additionalCardsCount=2 Number of additional cards for the `thief` at the beginning of the game. Default is `2`.
     * @apiSuccess {Object} options.roles.piedPiper Game pied piper role's options.
     * @apiSuccess {Number{>= 1 && <= 5}} options.roles.piedPiper.charmedPeopleCountPerNight=2 Number of charmed people by the `pied-piper` per night if there are enough targets (or number of not charmed players otherwise). Default is `2`.
     * @apiSuccess {Boolean} options.roles.piedPiper.isPowerlessIfInfected=true If set to `true`, `pied-piper` will be powerless if he is infected by the `vile-father-of-wolves`. Default is `true`.
     * @apiSuccess {Object} options.roles.raven Game raven role's options.
     * @apiSuccess {Number{>= 1 && <= 5}} options.roles.raven.markPenalty=2 Penalty of votes against the player targeted by the raven mark for the next village's vote. Default is `2`, meaning that the raven marked player will have two votes against himself.
     * @apiSuccess {GameHistory[]} history Game's history. (_See: [Classes - Game History](#game-history-class)_)
     * @apiSuccess {Object} [won] Winners of the game when status is `done`.
     * @apiSuccess {String={"werewolves", "villagers", "lovers", null}} won.by Can be either a group or a role. (_Possibilities: `werewolves`, `villagers`, `lovers` or null if nobody won_)
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
     * @apiParam (Query String Parameters) {Number} [history-limit] Number of game history's entries. Set to `0` for no limit.
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
        query("history-limit")
            .optional()
            .isInt({ min: 0 }).withMessage(`Must be a valid number equal or greater than 0`)
            .toInt(),
    ], Game.getGames);

    /**
     * @api {GET} /games/repartition B] Get a game repartition
     * @apiDescription Randomly affects role to players for a game.
     * @apiName GetGameRepartition
     * @apiGroup Games 🎲
     *
     * @apiParam (Query String Parameters) {Object[]} players Must contain between 4 and 40 players.
     * @apiParam (Query String Parameters) {String} players.name Player's name. Must be unique in the array.
     * @apiParam (Query String Parameters) {String[]} [forbidden-roles="[]"] Roles that won't be given by game repartition. All roles can be forbidden except `villager` and `werewolf`. (_See [Codes - Player Roles](#player-roles)_)
     * @apiParam (Query String Parameters) {Boolean} [are-recommended-min-players-respected=true] If set to `true`, game repartition will make sure that roles distributed respect the recommend min players in the game.
     * @apiParam (Query String Parameters) {Boolean} [are-powerful-villager-roles-prioritized=true] If set to `true`, villagers with powers will be given to players before simple villagers.
     * @apiParam (Query String Parameters) {Boolean} [are-powerful-werewolf-roles-prioritized=true] If set to `true`, werewolves with powers will be given to players before simple werewolves.
     * @apiPermission Basic
     * @apiPermission JWT
     * @apiSuccess {Object[]} players
     * @apiSuccess {String} players.name Player's name.
     * @apiSuccess {String} players.role Player's role.
     */
    app.get("/games/repartition", basicLimiter, passport.authenticate(["basic", "jwt"], { session: false }), [
        query("players")
            .customSanitizer(players => {
                if (Array.isArray(players)) {
                    return players;
                }
                return typeof players === "object" && players !== null ? Object.values(players).map(value => value) : [];
            })
            .isArray().withMessage("Must be a valid array")
            .custom(value => value.length >= 4 && value.length <= 40 ? Promise.resolve() : Promise.reject(new Error()))
            .withMessage("Must contain between 4 and 40 players"),
        query("forbidden-roles")
            .default([])
            .customSanitizer(forbiddenRoles => {
                if (Array.isArray(forbiddenRoles)) {
                    return forbiddenRoles;
                }
                return typeof forbiddenRoles === "object" && forbiddenRoles !== null ? Object.values(forbiddenRoles).map(value => value) : [];
            })
            .isArray().withMessage("Must be a valid array")
            .custom(roles => {
                const forbiddenRoles = getGameRepartitionForbiddenRoleNames();
                return roles.every(role => forbiddenRoles.includes(role)) ? Promise.resolve() : Promise.reject(new Error());
            })
            .withMessage(`Each forbidden role must be equal to one of the following values: ${getGameRepartitionForbiddenRoleNames()}`),
        query("players.*.name")
            .isString().withMessage("Must be a valid string")
            .trim()
            .notEmpty().withMessage("Can't be empty"),
        query("are-recommended-min-players-respected")
            .default(true)
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        query("are-powerful-villager-roles-prioritized")
            .default(true)
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        query("are-powerful-werewolf-roles-prioritized")
            .default(true)
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
    ], Game.getGameRepartition);

    /**
     * @api {GET} /games/:id C] Get a game
     * @apiName GetGame
     * @apiGroup Games 🎲
     *
     * @apiParam (Route Parameters) {ObjectId} id Game's ID.
     * @apiParam (Query String Parameters) {Number} [history-limit] Number of game history's entries. Set to `0` for no limit.
     * @apiPermission Basic
     * @apiPermission JWT
     * @apiUse GameResponse
     */
    app.get("/games/:id", basicLimiter, passport.authenticate(["basic", "jwt"], { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
        query("history-limit")
            .optional()
            .isInt({ min: 0 }).withMessage(`Must be a valid number equal or greater than 0`)
            .toInt(),
    ], Game.getGame);

    /**
     * @api {POST} /games D] Create a game
     * @apiName CreateGame
     * @apiGroup Games 🎲
     *
     * @apiPermission JWT
     * @apiParam (Request Body Parameters) {Object[]} players Must contain between 4 and 40 players.
     * @apiParam (Request Body Parameters) {String{>= 1 && <= 30}} players.name Player's name. Must be unique in the array and between 1 and 30 characters long.
     * @apiParam (Request Body Parameters) {String} players.role Player's role. (_See [Codes - Player Roles](#player-roles)_)
     * @apiParam (Request Body Parameters) {Number{>= 0}} [players.position] Player's unique position among all players. Maximum is `players.length - 1`. Either all players position must be set or none of them. In that last case, it will be generated automatically.
     * @apiParam (Request Body Parameters) {Object[]} [additionalCards] Game's additional cards. Must be set if role `thief` is in the game and contain 2 cards.
     * @apiParam (Request Body Parameters) {String} additionalCards.role Additional card's role. The role must be still available compared to the game's composition. (_See [Codes - Player Roles](#player-roles)_)
     * @apiParam (Request Body Parameters) {String} additionalCards.for Additional card's recipient. Must be equal to `thief`.
     * @apiParam (Request Body Parameters) {Object} [options] Game's options.
     * @apiParam (Request Body Parameters) {Object} [options.repartition] Game repartition's options.
     * @apiParam (Request Body Parameters) {Boolean} [options.repartition.isHidden=false] If set to `true`, game's repartition will be hidden to all players.
     * @apiParam (Request Body Parameters) {Object} [options.roles] Game roles options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.areRevealedOnDeath=true] If set to `true`, player's role is revealed when he's dead.
     * @apiParam (Request Body Parameters) {Object} [options.roles.sheriff] Game sheriff role's options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.sheriff.isEnabled=true] If set to `true`, `sheriff` will be elected the first tick and the responsibility will be delegated when he dies. Otherwise, there will be no sheriff in the game and tie in votes will result in another vote between the tied players. In case of another equality, there will be no vote.
     * @apiParam (Request Body Parameters) {Object} [options.roles.sheriff.electedAt] When the sheriff is elected during the game.
     * @apiParam (Request Body Parameters) {Number{>= 1 && <= 5}} [options.roles.sheriff.electedAt.turn=1] When the sheriff is elected during the game.
     * @apiParam (Request Body Parameters) {String{"night", "day"}} [options.roles.sheriff.electedAt.phase="night"] When the sheriff is elected during the game.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.sheriff.hasDoubledVote=true] If set to `true`, `sheriff` vote during the village's vote is doubled, otherwise, it's a regular vote.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.sheriff.canSettleVotes=true] If set to `true`, `sheriff` can settle votes if there is a tie in votes and no alive and powerful `scapegoat`. Default is `true`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.lovers] Game lovers options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.lovers.doRevealRoleToEachOther] If set to `true`, `lovers` reveal their role to each other when they wake up the first night. Default is `false`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.bigBadWolf] Game big bad wolf role's options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.bigBadWolf.isPowerlessIfWerewolfDies=true] If set to `true`, `big-bad-wolf` won't wake up anymore during the night if at least one player from the `werewolves` side died. Default is `true`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.whiteWerewolf] Game white werewolf role's options.
     * @apiParam (Request Body Parameters) {Number{>= 1 && <= 5}} [options.roles.whiteWerewolf.wakingUpInterval=2] Since first `night`, interval of nights when the `white-werewolf` is waking up. Default is `2`, meaning he wakes up every other night.
     * @apiParam (Request Body Parameters) {Object} [options.roles.seer] Game seer role's options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.seer.isTalkative=true] If set to `true`, the game master must say out loud what the seer saw during her night, otherwise, he must mime the seen role to the seer. Default is `true`.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.seer.canSeeRoles=true] If set to `true`, the seer can the exact `role` of the target, otherwise, she only sees the `side`. Default is `true`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.cupid] Game cupid role's options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.cupid.mustWinWithLovers=false] If set to `true`, the cupid teams up with the `lovers` and can't target himself when charming. Default is `false`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.littleGirl] Game little girl role's options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.littleGirl.isProtectedByGuard=false] If set to `false`, the little girl won't be protected by the guard from the werewolves attacks. Default is `false`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.guard] Game guard role's options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.guard.canProtectTwice=false] If set to `true`, the guard can protect twice in a row the same target. Default is `false`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.ancient] Game ancient role's options.
     * @apiParam (Request Body Parameters) {Number{>= 1 && <= 5}} [options.roles.ancient.livesCountAgainstWerewolves=2] Number of lives ancient has against `werewolves`. Default is `2`.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.ancient.doesTakeHisRevenge=true] If set to `true`, the `ancient` will make all players from the `villagers` side `powerless` if he dies from them. Default is `true`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.idiot] Game idiot role's options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.idiot.doesDieOnAncientDeath=true] If set to `true`, the idiot will die if he is revealed and the ancient is dead. Default is `true`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.twoSisters] Game two sisters role's options.
     * @apiParam (Request Body Parameters) {Number{>= 0 && <= 5}} [options.roles.twoSisters.wakingUpInterval=2] Since first `night`, interval of nights when the Two Sisters are waking up. Default is `2`, meaning they wake up every other night. If set to `0`, they are waking up the first night only.
     * @apiParam (Request Body Parameters) {Object} [options.roles.threeBrothers] Game three brothers role's options.
     * @apiParam (Request Body Parameters) {Number{>= 0 && <= 5}} [options.roles.threeBrothers.wakingUpInterval=2] Since first `night`, interval of nights when the Three Brothers are waking up. Default is `2`, meaning they wake up every other night. If set to `0`, they are waking up the first night only.
     * @apiParam (Request Body Parameters) {Object} [options.roles.fox] Game fox's role options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.fox.isPowerlessIfMissesWerewolf=true] If set to `true`, the fox will loose his power if he doesn't find a player from the `werewolves` side during his turn if he doesn't skip. Default is `true`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.bearTamer] Game bear tamer's role options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.bearTamer.doesGrowlIfInfected=true] If set to `true`, the bear tamer will have the `growls` attribute until he dies if he is `infected`. Default is `true`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.stutteringJudge] Game stuttering judge's role options.
     * @apiParam (Request Body Parameters) {Number{>= 1 && <= 5}} [options.roles.stutteringJudge.voteRequestsCount=1] Number of vote requests that the `stuttering-judge` can make during the game. Default is `1`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.wildChild] Game wild child's role options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.wildChild.isTransformationRevealed=false] If set to `true`, when `wild-child` joins the `werewolves` side because his model died, the game master will announce his transformation to other players. Default is `false`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.dogWolf] Game dog wolf's role options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.dogWolf.isChosenSideRevealed=false] If set to `true`, when `dog-wolf` chooses his side at the beginning of the game, the game master will announce the chosen side to other players. Default is `false`.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.dogWolf.isChosenSideRandom=false] If set to `true`, the chosen side for the `dog-wolf` will be randomly defined by the API. Default is `false`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.thief] Game thief's role options.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.thief.isChosenCardRevealed=false] If set to `true`, when `thief` chooses a card or skips, game master must tell the `thief` choice. Default is `false`.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.thief.mustChooseBetweenWerewolves=true] If set to `true`, if all `thief` additional cards are from the `werewolves` side, he can't skip and must choose one. Default is `true`.
     * @apiParam (Request Body Parameters) {Number{>= 1 && <= 5}} [options.roles.thief.additionalCardsCount=2] Number of additional cards for the `thief` at the beginning of the game. Default is `2`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.piedPiper] Game pied piper's role options.
     * @apiParam (Request Body Parameters) {Number{>= 1 && <= 5}} [options.roles.piedPiper.charmedPeopleCountPerNight=2] Number of charmed people by the `pied-piper` per night if there are enough targets (or number of not charmed players otherwise). Default is `2`.
     * @apiParam (Request Body Parameters) {Boolean} [options.roles.piedPiper.isPowerlessIfInfected=true] If set to `true`, `pied-piper` will be powerless if he is infected by the `vile-father-of-wolves`. Default is `true`.
     * @apiParam (Request Body Parameters) {Object} [options.roles.raven] Game raven's role options.
     * @apiParam (Request Body Parameters) {Number{>= 1 && <= 5}} [options.roles.raven.markPenalty=2] Penalty of votes against the player targeted by the raven mark for the next village's vote. Default is `2`, meaning that the raven marked player will have two votes against himself.
     * @apiUse GameResponse
     */
    app.post("/games", basicLimiter, passport.authenticate("jwt", { session: false }), [
        body("players")
            .isArray().withMessage("Must be a valid array")
            .custom(value => value.length >= 4 && value.length <= 40 ? Promise.resolve() : Promise.reject(new Error()))
            .withMessage("Must contain between 4 and 40 players"),
        body("players.*.name")
            .isString().withMessage("Must be a valid string")
            .trim()
            .isLength({ min: 1, max: 30 }).withMessage("Must be between 1 and 30 characters long"),
        body("players.*.role")
            .isString().withMessage("Must be a valid string")
            .isIn(getRoleNames()).withMessage(`Must be equal to one of the following values: ${getRoleNames()}`),
        body("players.*.position")
            .optional()
            .isInt({ min: 0 }).withMessage("Must be a valid integer greater or equal than 0")
            .toInt(),
        body("additionalCards")
            .optional()
            .isArray().withMessage("Must be a valid array"),
        body("additionalCards.*.role")
            .isString().withMessage("Must be a valid string")
            .isIn(getRoleNames()).withMessage(`Must be equal to one of the following values: ${getRoleNames()}`),
        body("additionalCards.*.for")
            .isString().withMessage("Must be a valid string")
            .isIn(getAdditionalCardsForRoleNames()).withMessage(`Must be equal to one of the following values: ${getAdditionalCardsForRoleNames()}`),
        body("options.repartition.isHidden")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.areRevealedOnDeath")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.sheriff.isEnabled")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.sheriff.electedAt.turn")
            .optional()
            .isInt({ min: 1, max: 5 }).withMessage("Must be a valid integer between 1 and 5")
            .toInt(),
        body("options.roles.sheriff.electedAt.phase")
            .optional()
            .isString().withMessage("Must be a valid string")
            .isIn(getGamePhases()).withMessage(`Must be equal to one of the following values: ${getGamePhases()}`),
        body("options.roles.sheriff.hasDoubledVote")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.sheriff.canSettleVotes")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.lovers.doRevealRoleToEachOther")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.bigBadWolf.isPowerlessIfWerewolfDies")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.whiteWerewolf.wakingUpInterval")
            .optional()
            .isInt({ min: 1, max: 5 }).withMessage("Must be a valid integer between 1 and 5")
            .toInt(),
        body("options.roles.seer.isTalkative")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.cupid.mustWinWithLovers")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.seer.canSeeRoles")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.littleGirl.isProtectedByGuard")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.guard.canProtectTwice")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.ancient.livesCountAgainstWerewolves")
            .optional()
            .isInt({ min: 1, max: 5 }).withMessage("Must be a valid integer between 0 and 5")
            .toInt(),
        body("options.roles.ancient.doesTakeHisRevenge")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.idiot.doesDieOnAncientDeath")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.twoSisters.wakingUpInterval")
            .optional()
            .isInt({ min: 0, max: 5 }).withMessage("Must be a valid integer between 0 and 5")
            .toInt(),
        body("options.roles.threeBrothers.wakingUpInterval")
            .optional()
            .isInt({ min: 0, max: 5 }).withMessage("Must be a valid integer between 0 and 5")
            .toInt(),
        body("options.roles.fox.isPowerlessIfMissesWerewolf")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.bearTamer.doesGrowlIfInfected")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.stutteringJudge.voteRequestsCount")
            .optional()
            .isInt({ min: 1, max: 5 }).withMessage("Must be a valid integer between 1 and 5")
            .toInt(),
        body("options.roles.wildChild.isTransformationRevealed")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.dogWolf.isChosenSideRevealed")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.dogWolf.isChosenSideRandom")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.thief.isChosenCardRevealed")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.thief.mustChooseBetweenWerewolves")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.thief.additionalCardsCount")
            .optional()
            .isInt({ min: 1, max: 5 }).withMessage("Must be a valid integer between 1 and 5")
            .toInt(),
        body("options.roles.piedPiper.charmedPeopleCountPerNight")
            .optional()
            .isInt({ min: 1, max: 5 }).withMessage("Must be a valid integer between 1 and 5")
            .toInt(),
        body("options.roles.piedPiper.isPowerlessIfInfected")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("options.roles.raven.markPenalty")
            .optional()
            .isInt({ min: 1, max: 5 }).withMessage("Must be a valid integer between 1 and 5")
            .toInt(),
    ], Game.postGame);

    /**
     * @api {PATCH} /games/:id/reset E] Reset a game
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
     * @apiParam (Request Body Parameters) {String} action Action of the play. (_Possibilities: [Codes - Player Actions](#player-actions)_)
     * @apiParam (Request Body Parameters) {Object[]} [targets] Player(s) affected by the play. Required when **action** is `use-potion`, `eat`, `look`, `protect`, `shoot`, `mark`, `delegate` or `settle-votes`.
     * @apiParam (Request Body Parameters) {ObjectId} targets.player Player's id.
     * @apiParam (Request Body Parameters) {Boolean} [targets.isInfected] Only if there is vile-father-of-wolves in the game and the action is `eat` from `werewolves`. Set to `true` and the werewolves victim will instantly join the `werewolves` side if possible.
     * @apiParam (Request Body Parameters) {Boolean} [targets.hasDrankLifePotion] Set to `true` if the `witch` saves target's life from werewolves meal.
     * @apiParam (Request Body Parameters) {Boolean} [targets.hasDrankDeathPotion] Set to `true` if the `witch` kills the target.
     * @apiParam (Request Body Parameters) {Object[]} [votes] Required when **action** is `elect-sheriff` or `vote`.
     * @apiParam (Request Body Parameters) {ObjectId} votes.from Vote's source id.
     * @apiParam (Request Body Parameters) {ObjectId} votes.for Vote's target id.
     * @apiParam (Request Body Parameters) {Boolean} [doesJudgeRequestAnotherVote]  Only if there is a `stuttering-judge` in the game and `action` is `vote` or `settle-votes`. If set to `true`, there is another vote immediately.
     * @apiParam (Request Body Parameters) {ObjectId} [card] Only available for `thief`, chosen card id of additional cards. Set if `thief` chose a card or must be set if both additional card are `werewolves` side.
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
        body("targets.*.isInfected")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("targets.*.player")
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("targets.*.hasDrankLifePotion")
            .optional()
            .isBoolean().withMessage("Must be a valid boolean")
            .toBoolean(),
        body("targets.*.hasDrankDeathPotion")
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
        body("doesJudgeRequestAnotherVote")
            .optional()
            .isBoolean().withMessage("Must be an valid boolean")
            .toBoolean(),
        body("card")
            .optional()
            .isMongoId().withMessage("Must be a valid MongoId"),
        body("side")
            .optional()
            .isString().withMessage("Must be a valid string")
            .isIn(getSideNames()).withMessage(`Must be equal to one of the following values: ${getSideNames()}`),
    ], Game.postPlay);

    /**
     * @api {GET} /games/:id/history H] Get game history
     * @apiName GetGameHistory
     * @apiGroup Games 🎲
     *
     * @apiPermission JWT
     * @apiPermission Basic
     * @apiParam (Route Parameters) {ObjectId} id Game's ID.
     * @apiParam (Query String Parameters) {String} [play-source] Filter by play's source. (_Possibilities: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) or `sheriff`_).
     * @apiParam (Query String Parameters) {String} [play-action] Filter by play's action. (_Possibilities: [Codes - Player Actions](#player-actions)_)
     * @apiSuccess {ObjectId} _id Game history entry's ID.
     * @apiSuccess {ObjectId} gameId Game's ID.
     * @apiSuccess {Number} turn Game's ID.
     * @apiSuccess {String="day","night"} turn Game's phase.
     * @apiSuccess {Number} tick Game's tick.
     * @apiSuccess {Play} play Game's play. (_See: [Classes - Play](#play-class)_)
     * @apiSuccess {Player[]} [deadPlayers] Player(s) that might died after the play.
     * @apiSuccess {Player[]} [revealedPlayers] Player(s) which role has been revealed after the play.
     */
    app.get("/games/:id/history", basicLimiter, passport.authenticate(["basic", "jwt"], { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
        query("play-source")
            .optional()
            .isIn(getWaitingForPossibilities()).withMessage(`Must be equal to one of the following values: ${getWaitingForPossibilities()}`),
        query("play-action")
            .optional()
            .isIn(getPlayerActions()).withMessage(`Must be equal to one of the following values: ${getPlayerActions()}`),
    ], GameHistory.getGameHistory);
};