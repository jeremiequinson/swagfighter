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
    app.service('LoginService', ['$http', '$rootScope', 'UserService', '$location',
        function($http, $rootScope, UserService, $location) {
            var service = this,
                rootpath = 'http://' + $location.host() + ':' + $location.port(),
                path = rootpath + '/backend/auth/';


            //Récupère l'url du module d'authenfication
            function getUrl() {
                return path;
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
    app.factory('SocketService', ['$q', '$rootScope', '$location', '$timeout', 'UserService', 'socketFactory', 'Flash',
        function ($q, $rootScope, $location, $timeout, UserService, socketFactory, Flash) {

            var SocketFactory = $q.defer();


            //Récupère l'utilisateur
            var getUser = function(){
                return UserService.getCurrentUser();
            };

            //Event broadcast disconnect
            var disconnectBroadcast = function(){
                $rootScope.$broadcast('socketDisconnected');
            };


            var resolvePromise = function() {

                // resolve in another digest cycle
                $timeout(function() {

                    // create the socket
                    var newSocket = (function() {

                        //Création du factory
                        var url = $location.host() + ":" + $location.port();
                        var user = getUser();
                        var token = user.token;
                        var username = user.username;
                        var query = 'token=' + token + "&username=" + username;
                        var socket = io.connect(url, {
                            query: query
                        });

                        var factory = socketFactory({
                            ioSocket: socket
                        });

                        //Supprime tout les evenements du socket et écoute les évènements de base
                        //Broadcast un evenement pour notifier le socket Reset
                        factory.resetListener = function(){
                            this.removeAllListeners();
                            $rootScope.$broadcast('socket.reset');
                        };

                        factory.forward('connected');

                        return factory;
                    })();

                    // resolve the promise
                    SocketFactory.resolve(newSocket);
                });
            };


            if(getUser() !== null){
                resolvePromise();
            }



            // listen for the authenticated event emitted on the rootScope of
            // the Angular app. Once the event is fired, create the socket and resolve
            // the promise.
            $rootScope.$on('authorized', resolvePromise);

            return SocketFactory.promise;
        }]);





    //UtilsService
    app.service('UtilsService', ['$http', '$rootScope', '$location',
        function($http, $rootScope, $location) {
            var service = this,
                rootpath = 'http://' + $location.host() + ':' + $location.port(),
                path = rootpath + '/backend/';

            //Récupère l'url
            var getUrl = function(action){
                return path + action;
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