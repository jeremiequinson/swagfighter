(function(){
    "use strict";

    var SocketConnectedUser = require('../models/connectedUsers.server.model');
    var Game = require('../models/game.server.model');


    var removeAllChallenger = function(userSocket){

        var socketid = userSocket.getSocketId();

        //Pour chaque joueur défié, on supprime le timer et on le notifie
        var challenging = userSocket.getChallenging();
        var challengers = userSocket.getChallengers();

        for(var targetid in challenging){
            var targetSocket = SocketConnectedUser.getUser(targetid);
            userSocket.removeChallenging(targetid); //On supprime le challenged
            targetSocket.removeChallenger(socketid);
        }

        for(var challengerid in challengers){
            var challengerSocket = SocketConnectedUser.getUser(challengerid);
            challengerSocket.removeChallenging(socketid);
        }

    };

    //Evenements socket pour la gestion des utilisateurs et des challenges
    module.exports = function(client){


        //Initialisation Liste des utilisateurs connectés
        client.on('lobby.userlist.init', function(){

            //Renvoie la liste des utilisateurs
            var listeUsers = SocketConnectedUser.getListUsername(client);
            client.emit('lobby.userlist.init', {users: listeUsers});
        });



        //Un joueur défie un autre joueur (CHALLENGER -> TARGET)
        client.on('challenge.send', function(data){

            var targetSocket = SocketConnectedUser.getUser(data.socketid);

            //Si le joueur est déconnecté
            if(targetSocket === null){
                client.emit('challenge.send.abort', {
                    socketid: data.socketid,
                    message: "Le joueur est déconnecté"
                });
                return false;
            }

            //D'abord, on vérifie que le joueur n'est pas déjà en train de nous défier
            if(targetSocket.hasChallenging(client.id)){
                client.emit('challenge.send.abort', {
                    socketid: data.socketid,
                    message: "Le joueur vous a déjà défié"
                });
                return false;
            }

            //Sinon on ajoute le target dans la liste
            client.userSocket.addChallenging(targetSocket);
        });


        //Requete refusé par un adversaire TARGET -> CHALLENGER
        client.on('challenge.get.remove', function(data){

            //On supprime le client de la liste des joueurs défié
            var challengerSocket = SocketConnectedUser.getUser(data.socketid);
            challengerSocket.removeChallenging(client.id);

            challengerSocket.getSocket().emit('challenge.send.remove', {socketid: client.id});
        });


        //Requete accepte par un adversaire TARGET -> CLIENT
        client.on('challenge.get.accept', function(data){

            var challengerSocket = SocketConnectedUser.getUser(data.socketid);
            var message, success;

            //Si le joueur n'est plus connecté
            if(challengerSocket === null){
                message = "Le joueur est déconnecté";
                success = false;
            }
            else{
                if(challengerSocket.canChallenge(client.id)){

                    //On supprime les challenges en cours
                    removeAllChallenger(client.userSocket);
                    removeAllChallenger(challengerSocket);

                    //On instancie des jeux
                    var game = new Game(challengerSocket, client.userSocket);
                console.log('GAME ID = ' + game.id);

                    //On notifie les deux joueurs
                    client.emit('challenge.togame', {
                        socketid: data.socketid,
                        gameid: game.id,
                        istarget: true
                    });

                    challengerSocket.getSocket().emit('challenge.togame', {
                        socketid: client.id,
                        gameid: game.id,
                        istarget: false
                    });

                    success = true;
                }
                else{
                    success = false
                    message = "Une erreur s'est produite. Impossible de lancer une partie.";
                }
            }

            //Si le joueur n'est plus disponible
            if(!success){
                client.emit('challenge.get.abort', {socketid: data.socketid, message: message});
            }
        });




        //Déconnexion
        client.on('disconnect', function(data){
            console.log("Déconnexion : " + client.id);

            //On récupère l'objet de la liste car parfois, socket.userSocket renvoie undefined
            var userSocket = SocketConnectedUser.getUser(client.id);

            client.broadcast.emit('user.disconnect', {
                username: userSocket.getUsername(),
                socketid: userSocket.getSocketId()
            });

            removeAllChallenger(userSocket);

            SocketConnectedUser.removeUser(userSocket.getSocketId());
        });



    };


}());