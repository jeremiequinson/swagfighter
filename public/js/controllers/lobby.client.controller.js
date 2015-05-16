(function(){
    "use strict";

    var app = angular.module('sfModule');




    //Controlleur de la liste des joueurs
    app.controller('LobbyController', ['$scope', '$rootScope', 'SocketService', '$timeout',
        function($scope, $rootScope, SocketService, $timeout){

            //Init lobby
            $scope.initLobby = function(){
                SocketService.then(function(SocketService){
                    SocketService.emit('lobby.init', '');
                });
            }

        }]);



    //Controlleur pour la page du Hall
    app.controller('UserlistController', ['$scope', '$rootScope', 'SocketService', 'UserService', '$timeout', 'Flash',
        function($scope, $rootScope, SocketService, UserService, $timeout, Flash){

            //Message
            $scope.user = UserService.getCurrentUser();
            $scope.listUsers = {};

            //Initialisation de la liste des utilisateurs connectés
            $scope.initUserList = function(){
                SocketService.then(function(SocketService){
                    SocketService.emit('lobby.userlist.init', '');
                });
            };


            //Retrouve les derniers messages
            SocketService.then(function(SocketService){


                //Recherche un joueur de la liste par son nom d'utilisateur
                var searchUserIdByUsername = function(username){
                    var keyToDelete = null;
                    angular.forEach($scope.listUsers, function(value, key){

                        if(value.username == username){
                            keyToDelete = key;
                            return false;
                        }
                    });

                    return keyToDelete;
                };


                //Ajout d'un user dans la liste des users connecté
                var addUser = function(socketid, username){

                    //On supprime les éventuels doublons
                    var duplicatedUserId = searchUserIdByUsername(username);
                    if($scope.listUsers[duplicatedUserId] !== undefined){
                        delete $scope.listUsers[duplicatedUserId];
                    }

                    //On ajoute pas l'utilisateur courant
                    if(username != $scope.user.username) {
                        $scope.listUsers[socketid] = {
                            username: username,
                            challenger: false,
                            challenged: false
                        };
                    }
                };

                //Suppression d'un user dans la liste des users connecté
                var removeUser = function(socketid){
                    if($scope.listUsers[socketid] !== undefined){
                        delete $scope.listUsers[socketid];
                    }
                };


                //Affiche un message lorsqu'un challenge est lancé
                var displayNewChallenge = function(socketid, user){
                    var username = user.username;
                    var message = "<table class='table-notification battle'><tr><td class='image'></td><td class='message'>" +
                        ""
                        + username + " vous défie. " +
                        "<button class='btn btn-sm btn-danger' ng-click=\"acceptBattleRequest('" + socketid + "')\">" +
                        "   accepter" +
                        "</button> " +
                        "<button class='btn btn-sm' title='petit bite' ng-click=\"ignoreBattleRequest('" + socketid + "')\">" +
                        "   refuser" +
                        "</button></td></tr></table>";

                    //Créé un flash, son id correspond au socket id
                    Flash.create('warning', message, {timeout: 60000, id: socketid, noclosebutton: true});
                };


                //Suppression du message challenge
                var removeChallengeMessage = function(socketid){
                    Flash.dismissById(socketid);
                };



                SocketService.on('lobby.userlist.init', function(data){

                    //Liste des utilisateurs déjà connectés
                    $scope.listUsers = {};

                    //On ajoute les utilisateurs
                    var users = data.users;
                    angular.forEach(users, function(user, key) {
                        addUser(key, user);
                    });
                });

                //Lorsqu'un utilisateur se connecte
                SocketService.on('user.connect', function(data){
                    console.log("Nouveau joueur");
                    addUser(data.socketid, data.username);
                });


                //Lorsqu'un utilisateur se déconnecte
                SocketService.on('user.disconnect', function(data){
                    removeUser(data.socketid);
                });


                //Requete annulée à cause d'une erreur
                SocketService.on('challenge.send.abort', function(data){
                    if($scope.listUsers[data.socketid] !== undefined) {
                        $scope.listUsers[data.socketid].challenged = false;
                    }

                    if(data.message != ""){
                        Flash.create('warning', data.message);
                    }

                    console.log('challenge to ' + data.socketid + ' aborted');
                });


                //Requete supprimé (expiration, refus du joueur)
                SocketService.on('challenge.send.remove', function(data){
                    if($scope.listUsers[data.socketid] !== undefined) {
                        $scope.listUsers[data.socketid].challenged = false;
                    }
                    console.log('challenge removed for ' + data.socketid);
                });




                //Lorsqu'on recoit une requete
                SocketService.on('challenge.get', function(data){
                    console.log("challenge.get");
                    var socketid = data.socketid;
                    var user = $scope.listUsers[socketid];

                    if($scope.listUsers[data.socketid] !== undefined) {
                        $scope.listUsers[data.socketid].challenger = true;
                    }

                    //ChallengeService.addChallenge(socketid, user);
                    displayNewChallenge(socketid, user);
                });

                //Lorsqu'une requete recu a expirée
                SocketService.on('challenge.get.remove', function(data){
                    var socketid = data.socketid;

                    if($scope.listUsers[data.socketid] !== undefined) {
                        $scope.listUsers[data.socketid].challenger = false;
                    }

                    //ChallengeService.removeChallenge(socketid);
                    removeChallengeMessage(socketid);
                });


                //Lorsqu'une requete recu a expirée
                SocketService.on('challenge.get.abort', function(data){
                    var socketid = data.socketid;
                    if($scope.listUsers[data.socketid] !== undefined) {
                        $scope.listUsers[data.socketid].challenger = false;
                    }

                    Flash.create('danger', "Impossible de créer une partie. " + data.message);
                });


                //Lorsqu'une requete recu a expirée
                SocketService.on('challenge.togame', function(data){
                    if(data.istarget){
                        alert('La partie commence :)');
                    }
                    else{
                        var username = $scope.listUsers[data.socketid].username;
                        alert(username + ' a accepté le défie !');
                    }

                    $rootScope.$broadcast("challenge.togame");
                });



                //lorsqu'on lance un défie
                $scope.challengePlayer = function(socketid){
                    $scope.listUsers[socketid].challenged = true;
                    SocketService.emit('challenge.send', {socketid: socketid});
                    console.log('challenge sent to ' + socketid);
                };



                //Action utilisateur sur le message Challenge
                $scope.$on('challenge.get.response', function(event, args){
                    var action = args.action;
                    var socketid = args.socketid;

                    //On supprime le message
                    Flash.dismissById(socketid);

                    if($scope.listUsers[socketid] === undefined) {
                        return;
                    }

                    $scope.listUsers[socketid].challenger = false;

                    SocketService.emit(action, {socketid: socketid});
                });



            });

        }]);








    //Controlleur du Chat
    app.controller('ChatController', ['$scope', '$rootScope', 'SocketService', 'UserService', '$timeout',
        function($scope, $rootScope, SocketService, UserService, $timeout){


            //Initialisation de la liste des utilisateurs connectés
            $scope.initChat = function () {
                SocketService.then(function(SocketService) {
                    SocketService.emit('lobby.chat.init', '');
                });
            };


            $scope.user = UserService.getCurrentUser();
            $scope.listMessage = [];
            $scope.currentMessage = "";

            //Retrouve les derniers messages
            SocketService.then(function(SocketService) {

                //Scroll en bas du chat
                var toScrollTop = function () {
                    $timeout(function () {
                        //Conteneur du chat
                        var o_cont = document.getElementById('chat_message_container');
                        if (o_cont) {
                            o_cont.scrollTop = o_cont.scrollHeight;
                        }
                    }, 40);
                };


                //Ajoute un message dans le chat
                var addMessage = function (message, username) {

                    var o_cont = document.getElementById('chat_message_container');
                    var isScrollBottom = (o_cont.scrollTop + o_cont.clientHeight == o_cont.scrollHeight);
                    var l = $scope.listMessage.length;

                    //Si l'auteur du message a écrit le précédent, on l'ajoute à la suite du block message (à la Skype)
                    if (l > 0 && $scope.listMessage[l - 1].user.username == username) {
                        $scope.listMessage[l - 1].messages.push(message);
                    }
                    else {
                        //Sinon on construit un nouveau messageBlock et on l'ajoute à la liste
                        var messageBlock = {
                            user:     {
                                username: username
                            },
                            messages: [message]
                        };

                        $scope.listMessage.push(messageBlock);
                    }

                    //Scroll en bas
                    if (isScrollBottom) {
                        toScrollTop();
                    }
                };


                //notification
                var addNotification = function (text) {

                    //Sale, faudra changer
                    var o_cont = document.getElementById('chat_message_container');
                    var isScrollBottom = (o_cont.scrollTop + o_cont.clientHeight == o_cont.scrollHeight);

                    //Sinon on construit un nouveau messageBlock et on l'ajoute à la liste
                    var messageBlock = {
                        user:           {
                            username: "robot",
                        },
                        isnotification: true,
                        messages:       [{message: text, date: new Date()}]
                    };

                    $scope.listMessage.push(messageBlock);

                    //Scroll en bas
                    if (isScrollBottom) {
                        toScrollTop();
                    }
                };




                //soumission du message
                $scope.submitMessage = function () {

                    //On envoie un message
                    SocketService.emit('chat.sendmessage', $scope.currentMessage);

                    //On l'ajoute dans le chat
                    var message = {
                        message: $scope.currentMessage,
                        date:    new Date()
                    };

                    addMessage(message, "Vous");

                    //On vide le message
                    $scope.currentMessage = "";
                };


                //Retrouve les derniers messages
                SocketService.on('lobby.chat.init', function (data) {
                    console.log('lobby.chat.init');

                    $scope.currentMessage = "";
                    $scope.listMessage = []; //Reset

                    //Liste des messages
                    var messages = data.messages;
                    messages.forEach(function (m) {
                        var message = {
                            message: m.text,
                            date:    m.date
                        };

                        addMessage(message, m.username);
                    });
                });


                //Lorsqu'un utilisateur reçoit un message
                SocketService.on('chat.messagesent', function (data) {
                    console.log('chat.messagesent', data);

                    //Ajoute le message dans le scope
                    var message = {
                        message: data.message,
                        date:    new Date()
                    };

                    addMessage(message, data.username);
                });


                //Lorsqu'un utilisateur se connecte
                SocketService.on('user.connect', function (data) {
                    //Ajoute le message dans le scope
                    var text = data.username + " vient de se connecter.";
                    addNotification(text);
                });




                //Lorsqu'un utilisateur se connecte
                SocketService.on('connected', function (data) {
                    console.log("CUSTOM" , data);
                    //Ajoute le message dans le scope
                    var text = "Vous êtes connecté.";
                    addNotification(text);
                });




                //Lorsqu'un utilisateur se déconnecte
                SocketService.on('user.disconnect', function (data) {
                    //Ajoute le message dans le scope
                    var text = data.username + " est déconnecté(e).";
                    addNotification(text);
                });

            });



        }]); //Fin ChatController







    //Controlleur du launcher
    app.controller('LauncherController', ['$scope', '$rootScope', 'SocketService', 'Flash',
        function($scope, $rootScope, SocketService, Flash){


        }]);








    //Affichage du chat
    app.directive('lobbyLauncher', ['SocketService', function(SocketService){
        return {
            restricted: 'E',
            templateUrl: 'views/partials/lobbylauncher.view.html'
        };
    }]);


    //Affichage du chat
    app.directive('lobbyChat', ['SocketService', function(SocketService){
        return {
            restricted: 'E',
            templateUrl: 'views/partials/lobbychat.view.html'
        };
    }]);

    //Affichage des joueurs connectés
    app.directive('lobbyPlayers', ['SocketService', function(SocketService){
        return {
            restricted: 'E',
            templateUrl: 'views/partials/lobbyplayers.view.html'
        };
    }]);


}());