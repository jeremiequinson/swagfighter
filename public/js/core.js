(function(){
    'use strict';

    var app = angular.module('sfModule', [
        'angular-storage',
        'ui.router',
        'flashModule',
        'ngAnimate',
        'btford.socket-io',
        'SFGame']
    );

    //Routes
    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
        function($stateProvider, $urlRouterProvider, $httpProvider){

            $urlRouterProvider.otherwise("/home");

            $stateProvider
                //Home page and infos
                .state('home', {
                    url: "/home",
                    templateUrl: "views/home"
                })

                //page de login et enregistrement
                .state('login', {
                    url: "/login",
                    data:{
                        typeAuth: "login"
                    },
                    views: {
                        '': {
                            templateUrl: "views/login",
                            controller: 'AuthController'
                        },
                        'authForm@login': {
                            templateUrl: "views/partials/loginform",
                            controller: 'LoginController'
                        }
                    }
                })

                //page de login et enregistrement
                .state('register', {
                    url: "/register",
                    data:{
                        typeAuth: "register"
                    },
                    views: {
                        '': {
                            templateUrl: "views/login",
                            controller: 'AuthController'
                        },
                        'authForm@register': {
                            templateUrl: "views/partials/registerform",
                            controller: 'RegisterController'
                        }
                    }
                })

                //Secure zone
                .state('compte', {
                    abstract: true,
                    template: "<ui-view/>",
                    data: {
                        requiredLogin: true,
                        useSocket: true
                    }
                })
                //Le "hall"
                .state('compte.lobby', {
                    url: "/lobby",
                    templateUrl: "views/lobby",
                    data:{
                        socketLocation: 'lobby'
                    }
                    //controller: 'LobbyController'
                })
                //Le jeu
                .state('compte.game', {
                    url: "/game",
                    templateUrl: "views/game",
                    data:{
                        socketLocation: 'game'
                    }
                    //controller: 'GameController'
                });


            $httpProvider.interceptors.push('APIInterceptor');

        }]);


    //Run
    app.run(['$rootScope', '$state', 'UserService', 'SocketService', '$timeout', 'Flash',
        function ($rootScope, $state, UserService, SocketService, $timeout, Flash) {

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

                if(toState.data !== undefined){

                    //Gestion des routes dont le login est requis ou non
                    var requireLogin = toState.data.requiredLogin;
                    var currentUser = UserService.getCurrentUser();
                    var isAuth = (toState.data.typeAuth !== undefined); //un peu sale mais bon. Si il y a une propriété typeAuth

                    if (requireLogin) {
                        if(currentUser === undefined || currentUser === null){
                            event.preventDefault();
                            $rootScope.$broadcast('unauthorized');
                            return;
                        }
                    }
                    else if(isAuth){
                        //Si un utilisateur est déjà connecté
                        if(currentUser !== undefined && currentUser !== null){
                            event.preventDefault();
                            $state.go('compte.lobby');
                            return;
                        }
                    }


                    //Changement de location

                    var location = toState.data.socketLocation || 'none';
                    SocketService.then(function(SocketService) {
                        SocketService.emit('location.change', location);
                    });
                    SocketService.then(function(SocketService) {

                        SocketService.resetListener();

                        SocketService.on('connected', function () {
                            //Si on souhaite notifier l'utilisateur
                            var message = "Vous êtes connecté au serveur";
                            Flash.create('success', message);

                            $rootScope.$broadcast('socket.connected');
                        });
                    });

                }

            });


            //Lorsque
            $rootScope.$on('challenge.togame', function(){
                $state.go('compte.game');
            });



        }]);










}());