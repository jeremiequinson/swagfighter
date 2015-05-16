/**
 * On configure l'authentification par token
 */

(function(){

    module.exports = function(passport) {

        var TokenStrategy = require('passport-token').Strategy,
            User = require('../app/models/mongoose/user.server.model');

        var strategyOptions = {
            usernameHeader: 'xcustomusername',
            tokenHeader:    'xcustomtoken',
            usernameField:  'custom-username',
            tokenField:     'custom-token'
        };


        passport.use('token-login', new TokenStrategy(strategyOptions,
            function (username, token, done) {

                User.findOne({username: username, token: token}, function (err, user) {

                    if (err) {
                        return done(err);
                    }

                    if (!user || user == null) {
                        return done(null, false);
                    }

                    if (!user.verifyToken(token)) {
                        return done(null, false);
                    }

                    return done(null, user);
                });
            }
        ));



        passport.use('token-logout', new TokenStrategy(strategyOptions,
            function (username, token, done) {

                User.findOne({username: username}, function (err, user) {

                    if (err) {
                        return done(err);
                    }

                    if (!user) {
                        return done(null, false);
                    }

                    //Token null
                    user.token = null;

                    return done(null, user);
                });
            }
        ));
    }

}());