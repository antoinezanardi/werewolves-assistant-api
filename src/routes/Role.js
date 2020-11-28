const { getRoles } = require("../helpers/functions/Role");

/**
 * @apiDefine RoleResponse
 * @apiSuccess {String} name Role's name. (_Possibilities: [Codes - Player Roles](#player-roles)_)
 * @apiSuccess {String} group Role's group. (_Possibilities: [Codes - Player Groups](#player-groups)_)
 * @apiSuccess {Number} maxInGame Maximum of this role in a game.
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