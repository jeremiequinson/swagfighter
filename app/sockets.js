(function(){

    module.exports = function(app) {

        "use strict";

        //Socket
        var server = require('http').createServer(app);
        var io = require('socket.io')(server);
        var clientsConnected = {};
        var User = require('../app/models/user.server.model');
        var _ = require('underscore');


        //Check si l'username et le token correspond à un utilisateur connecté. Sinon check dans la base de données et le connecte
        var checkAuthToken = function(client, username, token, callback){

            //Si le client est déjà connecté et authentifié
            if(clientsConnected[client.id] !== undefined){
                var client = clientsConnected[client.id];
                if(client.username == username && client.token == token){
                    callback(null, true);
                }
                else{
                    callback(null, false);
                }
            }
            else{

                //Sinon on recherche un utilisateur corresondant dans la base de données
                //Si un utilisateur existe, on l'ajoute dans la liste des clients, sinon on refuse l'authentification
                User.findOne({username: username, token: token}, function (err, user) {

                    //Si une erreur se produit
                    if (err) {
                        callback("Une erreur s'est produite lors de la communication avec la base de donnée", false);
                        return;
                    }

                    //Si aucun utilisateur n'a été trouvé
                    if (!user || user == null) {
                        callback("Nom d'utilisateur incorrect", false);
                        return;
                    }

                    //si le token est invalide
                    if (!user.verifyToken(token)) {
                        callback("Nom d'utilisateur incorrect", false);
                        return;
                    }

                    //on ajoute l'utilisateur à la liste
                    clientsConnected[client.id] = user;
                    callback(null, true, user);
                    return;
                });
            }
        };





        //Lorsque le client se connecte, on  envoie une demande d'authentification
        io.on('connection', function (client) {

            console.log("Un client se connecte ", client.id)

            client.authenticated = false;

            //Lorsque le client nous renvoie ses identifiants, on récupère l'objet user correspondant
            //Ensuite, on l'ajoute dans la liste des utilisateurs connecté
            client.on('authenticate', function (data) {

                var response = {};
                checkAuthToken(client, data.username, data.token, function(err, authorized, user){

                    if(!err && authorized){
                        //Log
                        console.log("Authenticated socket ", client.id);
                        console.log("Client authenticated ", clientsConnected[client.id].username);

                        //on authentifie le client
                        client.authenticated = true;
                        client.user = user;

                        //on autorise l'envoie de donnée au client
                        _.each(io.nsps, function(nsp) {
                            if(_.findWhere(nsp.sockets, {id: client.id})) {
                                console.log("restoring socket to", nsp.name);
                                nsp.connected[client.id] = client;
                            }
                        });

                        //Réponse
                        response = {error: false, message: "Authenticated"};
                    }
                    else{
                        //log
                        console.log("Authentication failed ", client.id);

                        //Réponse
                        response = {error: true, message: (err) ? err : "L'authentification a échouée."};
                    }

                    client.emit('authenticate', response);
                });
            });


            client.on('chat.message', function(data){

            });






            //Si le client n'est pas authentifié au bout de 5 secondes, on déconnecte le client
            setTimeout(function(){
                if (!client.authenticated) {
                    console.log("Disconnecting socket ", client.id);
                    client.disconnect('unauthorized');
                }
            }, 5000);

        });


        //Pour éviter que les client non connecté recoivent des données
        _.each(io.nsps, function(nsp){
            nsp.on('connect', function(client){
                if (!client.auth) {
                    console.log("removing socket from ", nsp.name)
                    delete nsp.connected[client.id];
                }
            });
        });


        return server;
    }


}());