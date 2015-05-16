/**
 * Module pour la gestion des flash message.
 * Inspiré d'un tutorial mais pimpé à mort.
 * Au lieu d'afficher qu'un message à la fois (donc le dernier message si on en créé 10 en 1000 millisecondes)
 * On peut afficher 5 messages. Stocker les autres dans une file d'attente et afficher le plus vieux de la file dès qu'un message visible est fermé ou terminé !
 * Ça c'est SWAG
 */
(function() {
    'use strict';
    var app = angular.module('flashModule', []);

    app.run(function ($rootScope) {
        // initialize variables
        $rootScope.flashList = [];

        $rootScope.flashQueue = [];

        $rootScope.flash = {};

        $rootScope.hasFlash = false;

    });

    // Directive for compiling dynamic html

    app.directive('dynamic', function ($compile) {
        return {
            restrict: 'A',
            replace:  true,
            link:     function (scope, ele, attrs) {
                scope.$watch(attrs.dynamic, function (html) {
                    ele.html(html);
                    $compile(ele.contents())(scope);
                });
            }
        };
    });

    // Directive for closing the flash message
    app.directive('closeFlash', function ($compile, Flash) {
        return {
            link: function (scope, ele) {
                ele.on('click', function () {
                    Flash.dismiss(scope.flash);
                });
            }
        };
    });

    // Create flashMessage directive
    app.directive('flashMessage', function ($compile, $rootScope) {
        return {
            restrict: 'A',
            templateUrl: '/views/partials/flash',
            /*link:     function (scope, ele, attrs) {
                // get timeout value from directive attribute and set to flash timeout
                //$rootScope.flash.timeout = parseInt(attrs.flashMessage, 10);
            }*/
        };
    });

    app.factory('Flash', ['$rootScope', '$timeout',
        function ($rootScope, $timeout) {

            var dataFactory = {},
                timeOut;

            //Recherche un flash message par id
            var searchIndexById = function(id, list){

                var listToSearch = list || $rootScope.flashList;

                for(var i = 0; i < $rootScope.flashList.length; i++){
                    if($rootScope.flashList[i].id === id){
                        return i;
                    }
                }
                return null;
            };

            //Recherche un flash avec son id
            var searchFlashById = function(id, list){
                var index = searchIndexById(id, list);

                if(index !== null){
                    return (!list) ? $rootScope.flashList[index] : $rootScope.flashQueue[index];
                }

                return null
            }


            //Supprimer un flash grace à son id
            var dismissById = function(id){
                //On cherche un flash du meme id dans la liste. Si un flash existe, on le supprime
                var flashWithSameId = searchFlashById(id);
                if(flashWithSameId === null){
                    flashWithSameId = searchFlashById(id, $rootScope.flashQueue);
                }

                //on supprime le flash
                if(flashWithSameId !== null){
                    dataFactory.dismiss(flashWithSameId);
                    return true;
                }

                return false;
            }


            //Supprime un message à partir d'un contenu
            dataFactory.dismissMessageByContent = function(text, type){
                var $this = this;

                $rootScope.flashList.forEach(function(f){
                    if(f.text == text && (type === undefined || f.type == type)){
                        $this.dismiss(f);
                    }
                });

                $rootScope.flashQueue.forEach(function(f){
                    if(f.text == text && (type === undefined || f.type == type)){
                        $this.dismiss(f);
                    }
                });
            }

            //Supprime un message à partir d'un contenu
            dataFactory.dismissById = function(id){
                var $this = this;
                return dismissById(id);
            }


            // Create flash message
            //Return the id
            dataFactory.create = function (type, text, options) {
                var $this = this;
                var params = options || {};
                var addClass = params.addClass || '';
                var time = params.timeout || 5000;
                var notimer = params.notimer || false;
                var id = params.id || new Date().getTime();
                var noclosebutton = params.noclosebutton;

                $timeout(function() {

                    //On supprime l'éventuel message flash qui comporterais le même id
                    dismissById(id);

                    //objet flash
                    var flash = {
                        id:       id,
                        type:     type,
                        text:     text,
                        addClass: addClass,
                        active:   true,
                        timeOut:  null,
                        noclosebutton: noclosebutton,
                        begin:    function () {
                            var $thisFlash = this;

                            if(!notimer) {
                                this.timeOut = $timeout(function () {
                                    $this.dismiss($thisFlash);
                                }, time);
                            }
                        }
                    };


                    if($rootScope.flashList.length >= 10){
                        //On l'ajoute à la file d'attente
                        $rootScope.flashQueue.push(flash);
                    }
                    else{
                        $rootScope.flashList.unshift(flash);//On l'ajoute en haut de la pile
                        $rootScope.flashList[0].begin();//Et on active le timer
                        $rootScope.hasFlash = true;
                    }

                }, 100);

                return id;
            };


            // Cancel flashmessage timeout function
            dataFactory.pause = function () {
                $timeout.cancel(timeOut);
            };

            // Dismiss flash message
            dataFactory.dismiss = function (flash) {

                $timeout.cancel(flash.timeOut);

                $timeout(function () {

                    var index = searchIndexById(flash.id);
                    if(index !== null){
                        $rootScope.flashList.splice(index, 1);

                        //Si la liste d'attente n'est pas vide, on prend le premier element de la file et on l'ajoute à la liste
                        if($rootScope.flashQueue.length > 0){
                            $rootScope.flashList.unshift($rootScope.flashQueue[0]);
                            $rootScope.flashQueue.shift(); //On supprime de la file d'attente
                            $rootScope.flashList[0].begin();//Et on active le timer
                        }
                    }
                });
            };

            return dataFactory;
        }
    ]);

}());