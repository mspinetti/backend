const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('../config/database');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

module.exports = function (passport) {
    logger.debug ('passport entry')

    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = config.secret;

    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        logger.info ('payload --> ' + JSON.stringify(jwt_payload))
        User.getUserById(jwt_payload._doc._id, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        })
    }))
}
