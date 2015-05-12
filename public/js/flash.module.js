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
            var searchIndexById = function(id){
                for(var i = 0; i < $rootScope.flashList.length; i++){
                    if($rootScope.flashList[i].id === id){
                        return i;
                    }
                }
                return null;
            };


            // Create flash message
            dataFactory.create = function (type, text, options) {
                var $this = this;
                var params = options || {};
                var addClass = params.addClass || '';
                var time = params.timeout || 5000;
                var notimer = params.notimer || false;



                $timeout(function() {

                    var flash = {
                        id:       new Date().getTime(),
                        type:     type,
                        text:     text,
                        addClass: addClass,
                        active:   true,
                        timeOut:  null,
                        begin:    function () {
                            var $thisFlash = this;

                            if(!notimer) {
                                this.timeOut = $timeout(function () {
                                    $this.dismiss($thisFlash);
                                }, time);
                            }
                        }
                    };

                    if($rootScope.flashList.length >= 2){
                        //On l'ajoute à la file d'attente
                        $rootScope.flashQueue.push(flash);
                    }
                    else{
                        $rootScope.flashList.unshift(flash);//On l'ajoute en haut de la pile
                        $rootScope.flashList[0].begin();//Et on active le timer
                        $rootScope.hasFlash = true;
                    }

                }, 50);
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