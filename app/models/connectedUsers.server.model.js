/**
 * Created by Jérémie Quinson on 14/05/15.
 */
(function () {
    'use strict';

    var UserSocket = require('./usersocket.server.model.js');
    var User = require('./mongoose/user.server.model.js');

    var connectedUsers = {};

    var moduleExport = {};



    /**
     * Private scope
     */

    //Ajoute un utilisateur (socket, user) dans la liste et retourne l'objet UserSocket
    var addConnectedUser = function(socket, user){
        var userSocket = new UserSocket(socket, user);
        connectedUsers[socket.id] = userSocket;
        return userSocket;
    };



    /**
     * Public Scope
     */

    // Middleware pour l'authentification de la connexion socket
    // Authorise ou non l'acces à un utilisateur. Vérifie d'abord que le socket n'existe pas déjà, sinon cherche dans la base de données
    moduleExport.authorizeUser = function(socket, next) {

        var handshakeData = socket.request;
        var username = handshakeData._query['username'];
        var token = handshakeData._query['token'];

        //Si l'utilisateur existe dans la base de donnée
        if (moduleExport.hasUser(socket.id)) {
            var userSocket = connectedUsers[connectedUsers];
            var user = userSocket.getUser();

            //Si les identifiants sont correct et que le token n'est pas expiré, C'est ok
            if (user.username == username && user.token == token && user.isTokenValid()) {
                return next();
            }
            else {
                return next(new Error('Un problème est survenue lors de l\'authentification sur le serveur : identifiants incorrect'));
            }

        } else {

            //Sinon on recherche un utilisateur corresondant dans la base de données
            //Si un utilisateur existe, on l'ajoute dans la liste des clients, sinon on refuse l'authentification
            User.findOne({username: username, token: token}, function (err, user) {

                //Si une erreur se produit
                if (err) {
                    return next(new Error('Un problème est survenue lors de l\'authentification sur le serveur'));
                }

                //Si aucun utilisateur n'a été trouvé
                if (!user || user == null) {
                    return next(new Error('Un problème est survenue lors de l\'authentification sur le serveur : Nom d\'utilisateur incorrect'));
                }

                //Si le token est invalide
                if (!user.verifyToken(token)) {
                    return next(new Error('Votre session a expirée.'));
                }

                //Ajoute l'utilisateur dans la liste des users connectés
                //Et dans l'objet socket
                var userSocket = addConnectedUser(socket, user);
                socket.userSocket = userSocket;

                //On notifie les utilisateurs
                socket.broadcast.emit("user.connect", {
                    socketid: socket.id,
                    username: userSocket.getUsername()
                });

                next();
            });
        }
    };


    //Vérifie si le socket est déjà stocké dans la liste des utilisateurs
    moduleExport.hasUser = function(socketid){
        return connectedUsers[socketid] !== undefined && connectedUsers[socketid] instanceof UserSocket;
    };

    //Récupère un utilisateur
    moduleExport.getUser = function(socketid){
        return (moduleExport.hasUser(socketid)) ? connectedUsers[socketid] : null;
    };

    //Supprime un utilisateur de la liste
    moduleExport.removeUser = function(socketid){
        if(moduleExport.hasUser(socketid)){
            delete connectedUsers[socketid];
        }
    };


    //Modifie directement un utilisateur
    moduleExport.changeLocation = function(socketid, location){
        var userSocket = moduleExport.getUser(socketid);
        userSocket.changeCurrentLocation(location);
        console.log(socketid + " in location " + location);
    };

    //Récupère la liste des utilisateurs connectés avec leur id
    moduleExport.getListUsername = function(socket){
        var result = {};

        for(var socketid in connectedUsers){

            var u = connectedUsers[socketid];
            var username = u.getUsername();

            //Si ce n'est pas l'utilisateur courant, on l'ajoute à la liste
            if(username != socket.userSocket.getUsername()){
                result[socketid] = username;
            }
        };

        return result;
    };




    module.exports = moduleExport;

}());