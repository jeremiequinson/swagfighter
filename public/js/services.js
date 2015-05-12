(function(){

    'use strict';



    var app = angular.module('sfModule');

    //Service pour le stockage de l'utilisateur dans le localstorage (swag) ou le cookies (Gide, pas swag du tout)
    app.service('UserService', ['store', function(store) {
            var service = this,
                currentUser = null;

            //Stocke l'utilisateur
            service.setCurrentUser = function(user) {
                currentUser = user;
                store.set('user', user);
                return currentUser;
            };

            //Récupère l'utilisateur
            service.getCurrentUser = function() {
                if (!currentUser) {
                    currentUser = store.get('user');
                }
                return currentUser;
            };
        }]);

    //Intercepteur. Ajoute le token à chaque requete
    app.service('APIInterceptor', ['$rootScope', 'UserService', function($rootScope, UserService) {
            var service = this;

            service.request = function (config) {

                var currentUser = UserService.getCurrentUser(),
                    access_token = currentUser ? currentUser.token : null,
                    username = currentUser ? currentUser.username : null;


                if (access_token && username) {
                    config.headers.xcustomtoken = access_token;
                    config.headers.xcustomusername = username;
                }

                return config;
            };

            service.responseError = function (response) {

                //Si une erreur 401
                if (response.status === 401 && response.data.errorToken === true) {
                    $rootScope.$broadcast('unauthorized');
                }
                return response;
            };
        }]);


     //Login service : Requête l'API pour loger l'user
    app.service('LoginService', ['$http', '$rootScope', 'HTTP_HOST', 'UserService', function($http, $rootScope, HTTP_HOST, UserService) {
            var service = this,
                path = '/backend/auth/';

            //Récupère l'url du module d'authenfication
            function getUrl() {
                return HTTP_HOST + path;
            }

            //Récupère une url pour une action specifique
            function getActionUrl(action) {
                return getUrl() + action;
            }

            var loginSuccess = function(data, status){
                if(status == 200){
                    UserService.setCurrentUser(data.user);
                    $rootScope.$broadcast('authorized');
                }
            };


            //Fonctions publiques
            service.login = function(credentials) {
                return $http.post(getActionUrl('login'), credentials).success(loginSuccess);
            };

            service.logout = function() {
                return $http.post(getActionUrl('logout'));
            };

            service.register = function(user) {
                return $http.post(getActionUrl('register'), user).success(loginSuccess);
            };
        }]);

    //Service Socket
    app.factory('SocketService', ['$rootScope', 'UserService', 'Flash',
        function ($rootScope, UserService, Flash) {
            var socket = null;
            var SocketFactory = {};

            //Connexion
            SocketFactory.connect = function(){
                socket = io.connect()
            };

            //Déconnexion
            SocketFactory.disconnect = function(){
                socket.disconnect();
                socket = null;
                Flash.create('info', "Vous êtes déconnecté du serveur");
            };

            //Lorsqu'on recoit un message
            SocketFactory.on = function (eventName, callback) {
                if(socket === null){
                    console.error('[Service Socket] Déconnecté du server');
                    return;
                }

                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            };

            //Lorsqu'on envoie un message
            SocketFactory.emit = function (eventName, data, callback) {

                //utilisateur stocké dans le datastorage
                var user = UserService.setCurrentUser();


                //Si socket null
                if(socket === null){

                    //Si l'utilisateur est authentifié, on le connect
                    if(user !== null){
                        this.connect();
                    }
                    else{
                        console.error('[Service Socket] Déconnecté du server');
                        return;
                    }
                }


                //Si user null, erreur et déconnexion
                if(user == null){
                    console.error('[Service Socket] Utilisateur déconnecté');
                    this.disconnect();
                    return;
                }


                //On encapsule les données dans un objet contenant: le message et l'utilisateur
                var newData = {
                    message: data,
                    user: {
                        username: user.username,
                        token: user.token
                    }
                };

                //On retourne le message
                socket.emit(eventName, newData, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            };


            return SocketFactory;
        }]);


    //UtilsService
    app.service('UtilsService', ['$http', '$rootScope', 'HTTP_HOST', function($http, $rootScope, HTTP_HOST) {
            var service = this,
                path = '/backend/';

            //Récupère l'url
            var getUrl = function(action){
                return HTTP_HOST + path + action;
            }

            //Fonctions publiques
            service.ensureUnique = function(value, schema, dbfield) {

                return $http({
                    method: 'POST',
                    url:    getUrl('unique-value'),
                    data: {
                        username: value,
                        schema:  schema,
                        dbfield: dbfield
                    }
                });
            };

    }]);



}());