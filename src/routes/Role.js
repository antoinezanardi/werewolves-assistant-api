const { getRoles } = require("../helpers/functions/Role");

/**
 * @apiDefine RoleResponse
 * @apiSuccess {String} name Role's name. (_Possibilities: [Codes - Player Roles](#player-roles)_)
 * @apiSuccess {String} side Role's original side. (_Possibilities: [Codes - Player Sides](#player-sides)_)
 * @apiSuccess {String} type Role's type. (_Possibilities: `villager`, `werewolf`, `ambiguous`, `lonely`_)
 * @apiSuccess {Number} [minInGame] If the role is chosen by at least one player, then minimum X players must choose it to start the game.
 * @apiSuccess {Number} maxInGame Maximum of this role in a game.
 * @apiSuccess {Number} [recommendedMinPlayers] It is recommended to have at least X players in game for choosing this role.
 */

module.exports = app => {
    /**
     * @api {GET} /roles A] Get roles
     * @apiName GetRoles
     * @apiGroup Roles 🃏
     *
     * @apiUse RoleResponse
     */
    app.get("/roles", (req, res) => {
        res.status(200).json(getRoles());
    });
};