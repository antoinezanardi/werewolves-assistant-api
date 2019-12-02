/* eslint-disable max-lines-per-function */
const passport = require("passport");
const { body } = require("express-validator");
const User = require("../controllers/User");

module.exports = app => {

    /**
     * @apiDefine BearerToken Bearer Authorization with User Token
     */

    /**
     * @apiDefine Basic Basic authentication with username and password
     */

    /**
     * @apiDefine UserRequestBody
     * @apiParam (Request Body Parameters) {String} email User's email.
     * @apiParam (Request Body Parameters) {String{>=5}} password User's password.
     */

    /**
     * @apiDefine UserResponse
     * @apiSuccess {ObjectID} _id User's ID.
     * @apiSuccess {String} email User's email.
     * @apiSuccess {Date} createdAt When the user is created.
     * @apiSuccess {Date} updatedAt When the user is updated.
     */

    /**
     * @api {POST} /users Create new user
     * @apiName CreateUser
     * @apiGroup User
     *
     * @apiUse UserRequestBody
     * @apiPermission Basic
     * @apiUse UserResponse
     */
    app.post("/users", passport.authenticate("basic", { session: false }), [
        body("email")
            .isEmail().withMessage("Must be a valid email")
            .trim(),
        body("password")
            .isString().withMessage("Must be a string")
            .isLength({ min: 5 }).withMessage("Must be at least 5 characters long"),
    ], User.postUser);

    /**
     * @api {GET} /users Get all users
     * @apiName GetUsers
     * @apiGroup User
     *
     * @apiPermission Basic
     * @apiUse UserResponse
     */
    app.get("/users", passport.authenticate("basic", { session: false }), User.getUsers);
};