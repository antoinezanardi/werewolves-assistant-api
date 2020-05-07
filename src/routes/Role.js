/* eslint-disable max-lines-per-function */
const passport = require("passport");
const Role = require("../controllers/Role");

module.exports = app => {

    /**
     * @apiDefine RoleResponse
     * @apiSuccess {MongoId} _id Game's ID.
     * @apiSuccess {String} name Role's name.
     * @apiSuccess {String} group Role's group.
     * @apiSuccess {String} maxInGame Maximum possible of this role in a game.
     */

    /**
     * @api {GET} /roles Get all roles
     * @apiName GetRoles
     * @apiGroup Game
     *
     * @apiPermission Basic
     * @apiUse RoleResponse
     */
    app.get("/roles", passport.authenticate("basic", { session: false }), Role.getRoles);
};