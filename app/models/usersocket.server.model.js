/**
 * Created by Jérémie Quinson on 14/05/15.
 */
(function () {
    'use strict';



    //User socket
    function UserSocket(p_socket, p_user){

        //Variables privées
        var socket = p_socket;         //Socket
        var user = p_user;             //Utilisateur
        var connectedAt = new Date();  //Date de connexion
        var currentLocation = null;    //Localisation de l'utilisateur sur l'application
        var challengers = {};          //Liste de challengers
        var challenging = {};          //Liste de joueur challengé
        var opponentSocket = null;
        var typeJoueur = null;
        var opponentReady = false;
        var $this = undefined;
        $this = this;


        //Retourne le socket id
        this.getSocketId = function(){
            return socket.id;
        };

        //Retourne l'objet socket
        this.getSocket = function(){
            return socket;
        };

        //Retourne l'objet user
        this.getUser = function(){
            return user;
        };

        //Retourne l'username
        this.getUsername = function(){
            return user.username;
        };

        //Retourne la date de connection
        this.getConnectedAt = function(){
            return connectedAt;
        };

        //Gestion des états
        this.changeCurrentLocation = function(loc){
            currentLocation= loc;
        };

        //Is location
        this.isCurrentLocation = function(loc){
            return currentLocation == loc;
        };

        //Un jeu est en cours?
        this.hasGame = function(){
            return opponentSocket !== null && opponentSocket !== undefined;
        };

        //Récupère le userSocket de son adversaire
        this.setOpponentSocket = function(socket){
            if(this.hasGame()) {
                return false;
            }
            else{
                opponentSocket = socket;
            }
        };

        //Récupère le userSocket de son adversaire
        this.getOpponentSocket = function(){
            if(this.hasGame()) {
                return opponentSocket;
            }

            return;
        };


        this.destroyGame = function(){
            opponentSocket = null;
            this.opponentReady = false;
        }



        //Add challenger
        //On notifie l'utilisateur qu'il est défié
        this.addChallenger = function(challengerSocket){
            if(challengers[challengerSocket.getSocketId()] === undefined){
                challengers[challengerSocket.getSocketId()] = challengerSocket;
            }
        };

        //Has challenger
        this.hasChallenger = function(socketid){
            return challengers[socketid] !== undefined;
        };

        //On supprime le challenger de la liste et on notifie le joueur défié
        this.removeChallenger = function(socketid){
            if(challengers[socketid] !== undefined){
                socket.emit('challenge.get.remove', {socketid: socketid});
                delete challengers[socketid];
            }
        };


        //Add challenging (ajoute un timer pour l'id de la personne challengée)
        this.addChallenging = function(userSocket){

            var targetid = userSocket.getSocketId();
            var targetSocket = userSocket.getSocket();



            //Si une requete est déjà en cours, on supprime le timer et on enregistre une nouvelle requete
            if(challenging[targetid] !== undefined){
                clearTimeout(challenging[targetid].timeout);
            }
            else{
                //Lorsque la requete expire, on supprime le challenge
                var expireChallenge = function(){
                    $this.removeChallenging(targetid); //On supprime le target de la liste du challenger
                    if(userSocket !== undefined) {
                        userSocket.removeChallenger(socket.id); //On supprime le challenger de la liste du target
                    }
                };

                //Nouveau challenge
                challenging[targetid] = {
                    timeout: setTimeout(expireChallenge, 30000)
                    //timeout: setTimeout(expireChallenge, 5000)
                };
            }

            //On notifie le joueur défié
            targetSocket.emit('challenge.get', {socketid: socket.id});
        };



        //Has challenging
        this.hasChallenging = function(targetid){
            return challenging[targetid] !== undefined;
        };


        //On supprime un player de la liste des joueurs défié et on notifie le challenger
        this.removeChallenging = function(targetid){
            if(challenging[targetid] !== undefined){
                //On stoppe le timer pour l'expiration
                clearTimeout(challenging[targetid].timeout);

                //On notifie le challenger
                socket.emit('challenge.send.remove', {socketid: targetid});

                //On supprime le challenge
                delete challenging[targetid];
            }
        };


        //Challengers
        this.getChallengers = function(){
            return challengers;
        };

        //Challengings
        this.getChallenging = function(){
            return challenging;
        };


        //Vérifie que le joueur (qui a lancé le challenge) est toujours disponible.
        this.canChallenge = function(targetid, callback){

            //Si le joueur n'apparait plus dans la liste des joueurs défié, la requete a expirée
            if(challenging[targetid] === undefined){
                return callback(false, "Le joueur n'est plus connecté");
                //return false;
            }

            //Si le challenger n'est plus sur le Lobby
            if(currentLocation !== UserSocket.LOCATION_LOBBY){
                return callback(false, "Le joueur n'est plus disponible");
                //return false;
            }

            return callback(true,"");
            //return true;
        };


    };


    //Constantes
    UserSocket.LOCATION_NONE = "none";
    UserSocket.LOCATION_LOBBY = "lobby";
    UserSocket.LOCATION_GAME = "game";
    UserSocket.LOCATION_GAMEEND = "gameend";


    //Getter/Setters







    module.exports = UserSocket;

}());