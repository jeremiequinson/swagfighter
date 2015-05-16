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
        var $this = this;


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
                    if(targetSocket !== undefined) {
                        targetSocket.removeChallenger(socket.id); //On supprime le challenger de la liste du target
                    }
                };

                //Nouveau challenge
                challenging[targetid] = {
                    timeout: setTimeout(expireChallenge, 30000)
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

        //Supprime tous les challenges en cours. Chaque joueur challengé est notifié.
        //Chaque joueur qui le challenge est aussi notifié
        /*this.removeAllChallenges = function(){


        };*/

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
                /*callback(false, "Le délais d'attente a expiré. Provoquez en duel le joueur ou attendez une proposition de sa part pour relancer une partie.");
                return;*/
                return false;
            }

            //Si le challenger n'est plus sur le Lobby
            if(currentLocation !== UserSocket.LOCATION_LOBBY){
                /*callback(false, "Le joueur n'est plus disponible pour une partie.");
                return;*/
                return false;
            }
            return true;
            /*console.log(callback);
            console.log(typeof(callback));*/

            //Si il est dispo, on pourra lancer les utilisateurs sur le jeu
            /*callback(true, null);
            return;*/
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