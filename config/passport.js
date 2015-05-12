/**
 * Configuration de l'authentification via Passport.
 * Pour le projet, on se contente de faire une authentification username/password
 */
(function(){

    var passport = require('passport');

    require('./passport_local')(passport);
    require('./passport_token')(passport);
    
    module.exports = passport;
}());