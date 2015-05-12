
var AuthController = require('./controllers/authentication.server.controller.js');
var CoreController = require('./controllers/core.server.controller.js');
var passport = require('../config/config').passport;


module.exports = function(app){


    //Init passport
    app.use(passport.initialize());
    app.use(passport.session());



    /**
     * / = frontent
     */
    app.get('/', CoreController.index);



    /**
     * /backend = Backend
     */

    //Vérifie que l'username n'est pas déjà utilisé
    app.post('/backend/unique-value', CoreController.uniqueValue);





    /**
     * /backend/auth = authentication
     */

    //Enregistrement de l'utilisateur
    //app.post('/backend/auth/register', passport.authenticate('local-signup', {failureRedirect: '/backend/auth/register-fail'}) , AuthController.login);
    app.post('/backend/auth/register', passport.authenticate('local-signup') , AuthController.login);

    //Route pour logger un utilisateur
    app.post('/backend/auth/login', passport.authenticate('local'), AuthController.login);

    //Route pour logout
    app.post('/backend/auth/logout', passport.authenticate('token-logout'), AuthController.logout);

    //Authentification par token requise pour chaque page de type /backend/api
    app.all('/backend/api/*', passport.authenticate('token-login', {failureRedirect: '/backend/auth/token-fail'}));

    //Redirection si token fail pour passer un message spécifique
    app.get('/backend/auth/token-fail', AuthController.tokenFail);



    //Game
    app.get('/backend/api/game', function(req, res){
        //console.log(req);
        res.send({machin: 'truc'});
    });




    /**
     * /views = Vues
     */
    //Pour récupérer les partials
    app.get('/views/*', function (req, res) {

        if(req.params[0] !== undefined){
            res.render('views/' + req.params[0]);
        }
        else{
            res.status(404).send('');
        }

    });


};