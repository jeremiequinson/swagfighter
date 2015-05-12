(function() {
    "use strict";

    var app = angular.module('sfModule');

    //Controlleur pour les tabs
    app.controller('AuthController', ['$scope', "$state",
        function($scope, $state) {

            //AuthTabController
            $scope.authTab = ($state.current.data.typeAuth == 'register') ? 2 : 1;

            $scope.isTabSet = function(tab){
                return $scope.authTab == tab;
            }
    }]);



    //Login controller
    app.controller('LoginController', ['$scope', '$state', 'LoginService', 'Flash',
        function ($scope, $state, LoginService, Flash) {

            //Login
            $scope.userLogin = {};
            $scope.userLogin = {username: "maosis"};//TEST

            $scope.login = function () {

                LoginService.login($scope.userLogin).then(function(response){

                    if(response.status == 200){
                        //Rediriger vers la page de dstination
                        $state.go('compte.lobby');
                        Flash.create("success", "Bienvenue " + response.data.user.username);
                        $scope.userLogin = {};
                    }
                    else if(response.status == 401){
                        //alert("Pas autorisé (TODO: Changer cette alerte pourrie en un message SWAG qui apparaitrait en haut).");
                        Flash.create("danger", "Les identifiants ne sont pas correct.");
                    }
                    else {
                        Flash.create("danger", "Une erreur s'est produite durant l'authentification");
                        //alert(" (TODO: Changer cette alerte pourrie en un message SWAG qui apparaitrait en haut).");
                    }

                });
            }
        }]);



    //Register controller
    app.controller('RegisterController', ['$scope', '$state', 'LoginService', 'Flash','UserService',
        function ($scope, $state, LoginService, Flash, UserService) {

            $scope.userRegister = {};
            $scope.userRegister = {username: "maosis"};//TEST

            $scope.addUser = function () {
                LoginService.register($scope.userRegister)
                    .then(function(response){
                        if(response.status == 200){
                            $scope.userRegister = {}; //en attendant
                            $state.go('compte.game');
                        }
                        else {
                            Flash.create("danger", "Une erreur s'est produite durant l'enregistrement");
                        }
                    });
            }

    }]);





    //Directive form login
    /*app.directive("loginForm", function () {
        return {
            restricted: 'E',
            templateUrl: 'views/directives/loginForm.view.html'
        };
    });*/


    //Directive form register
    /*app.directive("registerForm", function () {
        return {
            restricted: 'E',
            templateUrl: 'views/directives/registerForm.view.html'
        };
    });*/


     //Directive pour comparer les mots de passe
    app.directive("compareTo", function () {
        return {
            require: "ngModel",
            scope:   {
                otherModelValue: "=compareTo"
            },
            link: function (scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function (modelValue) {
                    return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function () {
                    ngModel.$validate();
                });
            }
        };
    });


    //Directive pour vérifier que le nom d'utilisateur est unique
    //On aurait pu faire un truc plus générique mais bon. YOLO
    app.directive('ensureUnique', ['UtilsService', function(UtilsService) {

        //on retourne la directive
        return {
            require: 'ngModel',
            link: function(scope, elem, attrs, ctrl) {

                //Fonction pour envoyer une requête et vérifier que la valeur est bien unique
                var requestIsUnique = function (event) {

                    var value = ctrl.$modelValue;
                    var dbinfo = scope.$eval(attrs.ensureUnique);

                    if(value !== undefined && value.replace(/\s/g, '').length > 0 ) {

                        ctrl.$setDirty();

                        UtilsService.ensureUnique(value, dbinfo.schema, dbinfo.dbfield)
                            .then(function (response) {
                                if (response.status == 200) {
                                    var data = response.data;

                                    //Si la valeur n'a pas changée entre temps.
                                    if (ctrl.$viewValue === value) {
                                        ctrl.$setValidity('unique', data.status);
                                    }
                                }
                            });
                    }
                    else{
                        ctrl.$setValidity('unique', true);
                    }
                };

                //Lorsqu'on modifie le champs
                elem.on('blur', requestIsUnique);
            }
        }
     }]);


}());