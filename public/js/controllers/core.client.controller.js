(function() {
    'use strict';

    var app = angular.module('sfModule');

    //Main controller
    app.controller('MainController', ['$scope', '$rootScope', '$state', 'LoginService', 'UserService', 'Flash', 'SocketService',
        function ($scope, $rootScope, $state, LoginService, UserService, Flash, SocketService) {


            //Utilisateur courant
            $scope.currentUser = UserService.getCurrentUser();

            //Etats sockets
            $scope.socketConnected = false;

            //Etats sockets
            $scope.socketAuthenticated = false;



            //Logout si utilisateur connecté
            $scope.logout = function () {

                //Si l'utilisateur est connecté
                if ($scope.currentUser !== null) {

                    LoginService.logout()
                        .then(function (response) {
                            $scope.currentUser = null;
                            UserService.setCurrentUser(null);
                            $state.go('login');
                            Flash.create('info', "Vous êtes déconnecté");

                        }, function (error) {
                            Flash.create('danger', "Une erreur s'est produite.");
                        });
                }
            };

            //Accept battle from flash
            $scope.acceptBattleRequest = function(socketid){
                $rootScope.$broadcast('challenge.get.response', {action: "challenge.get.accept", socketid: socketid});
            }

            //Ignore battle from flash
            $scope.ignoreBattleRequest = function(socketid){
                $rootScope.$broadcast('challenge.get.response', {action: "challenge.get.remove", socketid: socketid});
            }












            //Evenement authorisé (lorsque l'utilisateur se connecte)
            $rootScope.$on('authorized', function () {
                $scope.currentUser = UserService.getCurrentUser();
            });

            //Evenement authorisé (lorsque l'utilisateur n'est plus connecté)
            $rootScope.$on('unauthorized', function () {

                var isAuthenticated = UserService.getCurrentUser();
                var message = isAuthenticated ? "Votre session a expirée" : "Vous devez être connecté pour accèder à cette section.";

                $scope.currentUser = null;
                UserService.setCurrentUser(null);
                Flash.create('danger', message);
                $state.go('login');
            });




            //Evenement authorisé (lorsque l'utilisateur n'est plus connecté)
            $rootScope.$on('socket.connected', function () {
                $scope.socketConnected = true;
                $scope.socketAuthenticated = true;
            });








        }]);

}());