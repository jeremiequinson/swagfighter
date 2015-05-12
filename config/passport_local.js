(function(){

    module.exports = function(passport){

        var LocalStrategy = require('passport-local').Strategy,
            User = require('../app/models/user.server.model');

        //Fonction pour vérifier qu'un utilisateur existe
        passport.use(new LocalStrategy(
            function(username, password, done) {
                User.findOne({ username: username }, function(err, user) {

                    if (err) { return done(err); }
                    if (!user) {
                        return done(null, false, { message: 'Les identifiants sont incorrects' });
                    }
                    if (!user.validPassword(password)) {
                        return done(null, false, { message: 'Les identifiants sont incorrects' });
                    }
                    return done(null, user);
                });
            }
        ));


        //Fonction pour ajouter un utilisateur
        passport.use('local-signup', new LocalStrategy({
                usernameField : 'username',
                passwordField : 'password'
                //passReqToCallback : true
            },
            function(username, password, done) {

                // asynchronous
                // User.findOne wont fire unless data is sent back
                process.nextTick(function() {

                    // Si un utilisateur avec le nom d'utilisateur existe déjà, on retourne une erreur
                    User.findOne({ username :  username }, function(err, user) {
                        // if there are any errors, return the error
                        if (err) {
                            return done(err);
                        }

                        // check to see if theres already a user with that email
                        if (user) {
                            //return done(null, false, req.flash('signupMessage', "Le nom d'utilisateur n'est pas disponible"));
                            return done(null, false, {message: "Le nom d'utilisateur n'est pas disponible"});
                        }
                        else {

                            var newUser = new User();
                            newUser.username = username;
                            newUser.password = newUser.generateHash(password);

                            // save the user
                            newUser.save(function(err) {
                                if (err) {
                                    return done(err);
                                }

                                return done(null, newUser);
                            });
                        }

                    });

                });
            }));



        // used to serialize the user for the session
        passport.serializeUser(function(user, done) {
            done(null, user.id);
        });

        // used to deserialize the user
        passport.deserializeUser(function(id, done) {
            User.findById(id, function(err, user) {
                done(err, user);
            });
        });


    }


}());