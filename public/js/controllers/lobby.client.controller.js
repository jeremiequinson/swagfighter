(function(){
    "use strict";

    var app = angular.module('sfModule');

    //Controlleur pour la page du Hall
    app.controller('LobbyController', ['$scope', '$rootScope', 'SocketService', 'Flash', 'LoginService',
        function($scope, $rootScope, SocketService, Flash, LoginService){

        }]);



    //Controlleur du launcher
    app.controller('LauncherController', ['$scope', '$rootScope', 'SocketService', 'Flash', 'LoginService',
        function($scope, $rootScope, SocketService, Flash, LoginService){


        }]);



    //Controlleur du Chat
    app.controller('ChatController', ['$scope', '$rootScope', 'SocketService', 'UserService',
        function($scope, $rootScope, SocketService, UserService){

            //Message
            $scope.user = UserService.getCurrentUser();
            $scope.currentMessage = "";
            $scope.listMessage = {};


            var addMessage = function(message, username){

                //Date du message (pour l'instant on affiche que l'heure)
                var date = new Date()
                var hours = format_two_digits(date.getHours());
                var minutes = format_two_digits(date.getMinutes());
                var dateStr = hours + ":" + minutes;

                //objet message
                var message = {
                    date: dateStr,
                    message: message
                }

                //Si l'auteur du message a écrit le précédent, on l'ajoute à la suite du block message (à la Skype)
                if($scope.listMessage.length > 0 && $scope.listMessage[$scope.listMessage.length - 1].user.username == username){
                    $scope.listMessage[$scope.listMessage.length - 1].messages.push(message);
                }
                else{
                    //Sinon on construit un nouveau messageBlock et on l'ajoute à la liste
                    var messageBlock = {
                        user: {
                            username: username,
                        },
                        messages: [message]
                    };

                    $scope.listMessage.push(messageBlock);
                }
            }


            //soumission du message
            $scope.submitMessage = function(){

                //Lorsqu'un utilisateur reçoit un message
                SocketService.emit('chat.message', $scope.currentMessage);

                //Ajoute le message dans le scope
                addMessage($scope.currentMessage, $scope.user);

                //On vide le message
                $scope.currentMessage = "";
            }

            //Lorsqu'un utilisateur reçoit un message
            SocketService.on('chat.message', function(data){

                //Ajoute le message dans le scope
                addMessage(data.message, data.username);
            });

            //Lorsqu'un utilisateur se connecte
            SocketService.on('chat.connected', function(data){
                //Ajoute le message dans le scope
                addMessage("", data.username);
            });

        }]);


    //Controlleur de la liste des joueurs
    app.controller('PlayersController', ['$scope', '$rootScope', 'SocketService', 'Flash', 'LoginService',
        function($scope, $rootScope, SocketService, Flash, LoginService){

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