/* eslint-disable max-lines-per-function */
const passport = require("passport");
const { body, param } = require("express-validator");
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
     * @api {GET} /users A] Get users
     * @apiName GetUsers
     * @apiGroup Users 👤
     *
     * @apiPermission Basic
     * @apiUse UserResponse
     */
    app.get("/users", passport.authenticate("basic", { session: false }), User.getUsers);

    /**
     * @api {GET} /users/:id B] Get an user
     * @apiName GetUser
     * @apiGroup Users 👤
     *
     * @apiPermission Basic
     * @apiParam (Route Parameters) {ObjectId} id User's ID.
     * @apiUse UserResponse
     */
    app.get("/users/:id", passport.authenticate("basic", { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
    ], User.getUser);

    /**
     * @api {POST} /users B] Create new user
     * @apiName CreateUser
     * @apiGroup Users 👤
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
     * @api {POST} /users/login C] Login
     * @apiName LoginUser
     * @apiGroup Users 👤
     *
     * @apiUse UserRequestBody
     * @apiPermission Basic
     * @apiSuccess {String} token JSON Web Token to keep for further route authentication.
     */
    app.post("/users/login", passport.authenticate("basic", { session: false }), [
        body("email")
            .isEmail().withMessage("Must be a valid email")
            .trim(),
        body("password")
            .isString().withMessage("Must be a string")
            .isLength({ min: 5 }).withMessage("Must be at least 5 characters long"),
    ], User.login);
};