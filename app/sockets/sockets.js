(function(){

    "use strict";

    //Socket
    var _ = require('underscore');
    var SocketConnectedUser = require('../models/connectedUsers.server.model');
    var UserSocket = require('../models/usersocket.server.model');



    module.exports = function(app) {
        var server = require('http').createServer(app);
        var io = require('socket.io')(server);

        //Middleware pour authenfier l'utilisateur avant de l'ajouter à la liste
        io.use(SocketConnectedUser.authorizeUser);


        //Lorsque le client se connecte, on  envoie une demande d'authentification
        io.on('connection', function (client) {

            console.log("Un client se connecte ", client.id);

            client.emit('connected', {socketid: client.id});


            //On change la localisation de l'user
            client.on('lobby.init', function(){
                //SocketConnectedUser.changeLocation(client.id, UserSocket.LOCATION_LOBBY);
            });

            //On change la localisation de l'user
            client.on('game.init', function(){
                //SocketConnectedUser.changeLocation(client.id, UserSocket.LOCATION_GAME);
            });

            //Change location
            client.on('location.change', function(data){

                //Filtre sur location
                switch(data){
                    case UserSocket.LOCATION_LOBBY:
                        SocketConnectedUser.changeLocation(client.id, UserSocket.LOCATION_LOBBY);
                        break;

                    case UserSocket.LOCATION_GAME:
                        SocketConnectedUser.changeLocation(client.id, UserSocket.LOCATION_GAME);
                        break;

                    default:
                        SocketConnectedUser.changeLocation(client.id, UserSocket.LOCATION_NONE);
                        break;
                }
            });


            client.on('game.set.playerudpate', function(data){

                console.log('Update game ',  data);
                //Si aucun jeu n'est en cours
                /*if(!client.userSocket.hasGame() && false){ //TODO : Enlever le false pour les tests
                    client.emit('socket.error.game', {error: true, message: "Aucun jeu lancé"});
                    return false;
                }*/

                //On récupère l'opposant et on lui envoie les infos
                var opponentSocket = client.userSocket.getOpponentSocket();
                if(opponentSocket !== undefined){
                    console.log('Message To ' + opponentSocket.getUsername());
                    opponentSocket.getSocket().emit('game.get.playerudpate', data);
                }
            });




            //On ajoute les evenements des différents modules
            require('./socket_chat')(client);
            require('./socket_user')(client);

        });

        return server;
    }

}());