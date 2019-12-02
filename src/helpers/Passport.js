const passport = require("passport");
const bcrypt = require("bcrypt");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JWTStrategy, ExtractJwt: ExtractJWT } = require("passport-jwt");
const { BasicStrategy } = require("passport-http");
const User = require("../models/User");
const Config = require("../../config");

passport.use(new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, cb) => User.findOne({ email: email }, (err, user) => {
    if (err) {
        cb(err);
    } else if (!user) {
        return cb(null, false, { message: "Incorrect email or password." });
    } else {
        bcrypt.compare(password, user.password, (err, res) => {
            if (!err && res) {
                return cb(null, user, { message: "Logged In Successfully" });
            } else {
                return cb(null, false, { message: "Incorrect email or password." });
            }
        });
    }
})));

passport.use(new BasicStrategy((username, password, done) => {
    if (username === Config.app.basicAuth.username && password === Config.app.basicAuth.password) {
        return done(null, { strategy: "basic" });
    } else {
        return done(null, false);
    }
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: Config.app.JWTSecret,
}, (jwtPayload, cb) => {
    User.findById(jwtPayload.userId, "_id email", (err, user) => {
        if (err) {
            return cb(err);
        } else if (user) {
            if (user.active) {
                return cb(null, user);
            } else {
                return cb(null);
            }
        } else {
            return cb(null);
        }
    });
}));