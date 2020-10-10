const passport = require("passport");
const bcrypt = require("bcrypt");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JWTStrategy, ExtractJwt: ExtractJWT } = require("passport-jwt");
const { BasicStrategy } = require("passport-http");
const User = require("../../db/models/User");
const Config = require("../../../config");

// TODO: Error response for bad auth in jwt check for example.
function baseLocalStrategy(email, password, cb) {
    return User.findOne({ email }, (err, user) => {
        if (err) {
            cb(err);
        } else if (!user) {
            return cb(null, false, { message: "Incorrect email or password." });
        } else {
            bcrypt.compare(password, user.password, (compareErr, res) => {
                if (!compareErr && res) {
                    return cb(null, user, { message: "Logged In Successfully" });
                }
                return cb(null, false, { message: "Incorrect email or password." });
            });
        }
    });
}

passport.use(new LocalStrategy({ usernameField: "email", passwordField: "password" }, baseLocalStrategy));

passport.use(new BasicStrategy((username, password, done) => {
    if (username === Config.app.basicAuth.username && password === Config.app.basicAuth.password) {
        return done(null, { strategy: "basic" });
    }
    return done(null, false);
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: Config.app.JWTSecret,
}, (jwtPayload, cb) => {
    User.findById(jwtPayload.userId, "_id email", (err, user) => {
        if (err) {
            return cb(err);
        } else if (user) {
            return cb(null, { ...user.toJSON(), strategy: "JWT" });
        }
        return cb(null);
    });
}));