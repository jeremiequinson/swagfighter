(function() {
    'use strict';

    var app = angular.module('sfModule');

    app.controller('GameController', ['$scope', '$http', 'SocketService', 'HTTP_HOST', 'Flash', '$timeout',
        function ($scope, $http, SocketService, HTTP_HOST, Flash, $timeout) {

            SocketService.connect();

            SocketService.emit('test', {message: "machin truc", truc: [2, 5, 9]}, function (data) {
                console.log('Callback', data);
            });
            SocketService.disconnect();


            $scope.test = function () {
                $http.get(HTTP_HOST + '/backend/api/game')
                    .success(function (data) {
                        console.log(data);
                    });
            };

        }]);

}());
