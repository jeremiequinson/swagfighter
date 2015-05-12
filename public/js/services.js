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


            //test si l'utilisateur peut utiliser le service de socket.
            var getUser = function(){

                //utilisateur stocké dans le datastorage
                var user = UserService.getCurrentUser();

                //Si l'utilisateur est authentifié, on retourne l"utilisateur.
                if(user != null) {

                    //Si il n'est pas encore connecté au serveur, on le connect
                    if(socket == null){
                        SocketFactory.connect(user);
                    }

                    return user;
                }
                else{
                    //Sinon on le déconnecte s'il est encore connecté
                    SocketFactory.disconnect();
                    console.error('[Service Socket] Utilisateur déconnecté');
                    return null;
                }
            }


            //Retourne true si l'utilisateur est actuellement connecté et authentifié
            SocketFactory.isAuthenticated = function(){
                return socket.authenticated;
            }


            //Connexion
            SocketFactory.connect = function(user){
                if(socket == null){
                    socket = io.connect();
                    socket.authenticated = false;

                    if(!user){
                        user = UserService.getCurrentUser();
                    }

                    socket.on('connect', function(){

                        Flash.create("info", "Vous êtes connecté au serveur");

                        SocketFactory.emit('authenticate', {username: user.username, token: user.username});

                        socket.on('authenticate', function(data){
                            if(data.error){
                                console.log("Impossible de s'authentifier : " + data.message);
                            }
                            else{
                                console.log("Utilisateur authentifié : " + data.message);
                                socket.authenticated = true;
                            }
                        });

                        socket.on('disconnect', function(data){
                            SocketFactory.disconnect(true);
                        });
                    });
                }
            };

            //Déconnexion
            SocketFactory.disconnect = function(canretry){
                if(socket != null){
                    socket.disconnect();
                    socket = null;

                    var message = "Vous avez été déconnecté du serveur";
                    var options = {};
                    if(canretry){
                        message += "<br/> <a href ng-click='connectSocket()' close-flash>Se reconnecter</a>";
                        options.timeout = 5000;
                    }

                    Flash.create('info', message, options);
                }
            };

            //Lorsqu'on recoit un message
            SocketFactory.on = function (eventName, callback) {

                var user = getUser();

                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            };


            //Lorsqu'on envoie un message
            SocketFactory.emit = function (eventName, data, callback) {
                /*
                var user = getUser();

                //On encapsule les données dans un objet contenant: le message et l'utilisateur
                var newData = {
                    message: data,
                    user: {
                        username: user.username,
                        token: user.token
                    }
                };*/

                //On retourne le message
                socket.emit(eventName, data, function () {
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