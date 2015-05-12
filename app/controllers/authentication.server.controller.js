/**
 * Controlleur gérant toutes les requêtes d'authenfication d'un utilisateur.
 * Login, Logout, signin, test d'authentification...
 * @type {exports}
 */

var User = require('../models/user.server.model');

module.exports = {


    //Log l'utilisateur. Créé un nouveau token valide 3 jours et le stocke dans l'objet user. Retourne l'objet user.
    login: function(req, res, infos){
        req.user.generateToken(); //On genere un token et on le stocke
        req.user.save(function(err, user){
            if(err){
                res.json({error: true, message: "Une erreur s'est produite lors de l'authentification."});
            }
            else{
                res.json({error: false, user: user});
            }
        });
    },

    //Log l'utilisateur. Créé un nouveau token valide 3 jours et le stocke dans l'objet user. Retourne l'objet user.
    logout: function(req, res, infos){
        res.json({error: false, message: "Utilisateur déconnecté."});
    },


    //permet de ne pas envoyer un 401
    tokenFail: function(req, res, next) {
        res.statusCode = 401;
        res.json({errorToken: true});
    }




}

