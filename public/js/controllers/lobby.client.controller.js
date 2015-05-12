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
    app.controller('ChatController', ['$scope', '$rootScope', 'SocketService',
        function($scope, $rootScope, SocketService){

            //Message
            $scope.message = {};

            //soumission du message
            $scope.submitMessage = function(){
                $scope.message = {};

                //Lorsqu'un utilisateur reçoit un message
                SocketService.on('chat.messages', function(data){
                    console.log("messages:", data);
                });
            }

            //Lorsqu'un utilisateur reçoit un message
            SocketService.on('chat.messages', function(data){
                console.log("messages:", data);
            });

            //Lorsqu'un utilisateur se connecte
            SocketService.on('chat.connected', function(data){
                console.log("Connected:", data);
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