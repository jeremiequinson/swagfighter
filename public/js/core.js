(function(){
    'use strict';

    var app = angular.module('sfModule', ['angular-storage', 'ui.router', 'flashModule', 'ngAnimate'])
        .constant('HTTP_HOST', 'http://localhost:8080');

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
                        requiredLogin: true
                    }
                })
                //Le "hall"
                .state('compte.lobby', {
                    url: "/lobby",
                    templateUrl: "views/lobby",
                    controller: 'LobbyController'
                })
                //Le jeu
                .state('compte.game', {
                    url: "/game",
                    templateUrl: "views/game",
                    //controller: 'GameController'
                });


            $httpProvider.interceptors.push('APIInterceptor');

        }]);


    //Run
    app.run(['$rootScope', '$state', 'UserService', function ($rootScope, $state, UserService) {

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

                if(toState.data !== undefined){
                    var requireLogin = toState.data.requiredLogin;
                    var currentUser = UserService.getCurrentUser();
                    var isAuth = (toState.data.typeAuth !== undefined); //un peu sale mais bon

                    if (requireLogin) {
                        if(currentUser === undefined || currentUser === null){
                            event.preventDefault();
                            $rootScope.$broadcast('unauthorized');
                        }
                    }
                    else if(isAuth){
                        //Si un utilisateur est déjà connecté
                        if(currentUser !== undefined && currentUser !== null){
                            event.preventDefault();
                            $state.go('compte.lobby');
                        }
                    }
                }

            });

        }]);










}());