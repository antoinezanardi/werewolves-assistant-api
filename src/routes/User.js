const passport = require("passport");
const { body, param, query } = require("express-validator");
const User = require("../controllers/User");
const { createAccountLimiter, loginLimiter, basicLimiter } = require("../helpers/constants/Route");

module.exports = app => {
    /**
     * @apiDefine JWT Bearer Authorization with JSON Web Token.
     */

    /**
     * @apiDefine Basic Basic authentication with username and password.
     */

    /**
     * @apiDefine UserRequestBody
     * @apiParam (Request Body Parameters) {String{>= 50}} email User's email.
     * @apiParam (Request Body Parameters) {String{>= 5 && <= 50}} password User's password.
     */

    /**
     * @apiDefine UserResponse
     * @apiSuccess {ObjectID} _id User's ID.
     * @apiSuccess {String} email User's email.
     * @apiSuccess {Object} registration User's registration data.
     * @apiSuccess {String} registration.method How the user registered himself. (_Possibilities: `manual`, `facebook` or `google`_)
     * @apiSuccess {Date} createdAt When the user is created.
     * @apiSuccess {Date} updatedAt When the user is updated.
     */

    /**
     * @api {GET} /users A] Get users
     * @apiName GetUsers
     * @apiGroup Users 👤
     *
     * @apiPermission Basic
     * @apiParam (Query String Parameters) {String} [fields] Specifies which user fields to include. Each value must be separated by a `,` without space. (e.g: `field1,field2`)
     * @apiUse UserResponse
     */
    app.get("/users", passport.authenticate("basic", { session: false }), [
        query("fields")
            .optional()
            .isString().withMessage("Must be a valid string")
            .custom(value => (/^(?:\w+)(?:,\w+)*$/u).test(value) ? Promise.resolve() : Promise.reject(new Error()))
            .withMessage("Each value must be separated by a `,` without space. (e.g: `field1,field2`)"),
    ], User.getUsers);

    /**
     * @api {GET} /users/:id B] Get an user
     * @apiName GetUser
     * @apiGroup Users 👤
     *
     * @apiPermission JWT
     * @apiPermission Basic
     * @apiParam (Route Parameters) {ObjectId} id User's ID.
     * - `JWT Auth`: Only user attached to token can be retrieved from this route.
     * - `Basic Auth`: Any user can be retrieved.
     * @apiUse UserResponse
     */
    app.get("/users/:id", basicLimiter, passport.authenticate(["jwt", "basic"], { session: false }), [
        param("id")
            .isMongoId().withMessage("Must be a valid MongoId"),
    ], User.getUser);

    /**
     * @api {POST} /users C] Create new user
     * @apiName CreateUser
     * @apiGroup Users 👤
     *
     * @apiUse UserRequestBody
     * @apiUse UserResponse
     */
    app.post("/users", createAccountLimiter, [
        body("email")
            .isEmail().withMessage("Must be a valid email")
            .trim()
            .isLength({ max: 50 }).withMessage("Can't exceed 50 characters long"),
        body("password")
            .isString().withMessage("Must be a string")
            .isLength({ min: 5, max: 50 }).withMessage("Must be at least 5 characters long"),
    ], User.postUser);

    /**
     * @api {POST} /users/login D] Login
     * @apiName LoginUser
     * @apiGroup Users 👤
     *
     * @apiUse UserRequestBody
     * @apiSuccess {String} token JSON Web Token to keep for further route authentication.
     */
    app.post("/users/login", loginLimiter, [
        body("email")
            .isEmail().withMessage("Must be a valid email")
            .trim()
            .isLength({ max: 50 }).withMessage("Can't exceed 50 characters long"),
        body("password")
            .isString().withMessage("Must be a string")
            .isLength({ min: 5, max: 50 }).withMessage("Must be at least 5 characters long"),
    ], User.login);

    /**
     * @api {POST} /users/login/facebook E] Login with Facebook
     * @apiName LoginFacebookUser
     * @apiGroup Users 👤
     *
     * @apiParam (Request Body Parameters) {String} accessToken Facebook user's access token for the Werewolves Assistant app.
     * @apiSuccess {String} token JSON Web Token to keep for further route authentication.
     */
    app.post("/users/login/facebook", [
        body("accessToken")
            .isString().withMessage("Must be a valid string"),
    ], User.loginWithFacebook);
};