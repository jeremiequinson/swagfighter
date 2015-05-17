/**
 * Created by Jérémie Quinson on 15/05/15.
 */
(function () {
    'use strict';


    //Game module
    var app = angular.module('SFGame', [
        'SFGame.UI'
    ]);


    app.factory('GameFactory', ['GameConfig', 'StageSprite', 'Player', 'SocketService',
        function(GameConfig, StageSprite, Player, SocketService){

        function getNewGame(){
            //Pour créer une instance de jeu
            var game = {
                context:      null,
                stageSprite:  null,
                mainPlayer:   null,
                onlinePlayer: null,
                spritesItems: [],
                clock:        null,
                startTimer:   0,
                x:            0,
                y:            0,
                width:        0,
                height:       0,
                nbTick:       0,
                frameReq: null,


                //Events
                _onKeyPress:          function (event) {
                    this.mainPlayer.bindKey(event.charCode, "press");
                },
                _onKeyRelease:        function (event) {
                    this.mainPlayer.bindKey(event.keyCode, "release");
                },

                //Rendu du stage
                _updateStagePosition: function () {
                    //Taille du canvas
                    this.context.canvas.width = window.innerWidth;
                    this.context.canvas.height = window.innerHeight;

                    //Taille du stage
                    this.x = (window.innerWidth - this.width) / 2;
                    this.y = (window.innerHeight - this.height) / 2;
                    this.stageSprite.updatePosition(this.x, this.y);
                },
                _update: function(){

                    //Timer
                    var timer = 0;

                    if(this.startTimer == 0){
                        this.startTimer = new Date().getTime() / 1000;
                    }
                    else{
                        var currentTimer = new Date().getTime() / 1000;
                        timer = currentTimer - this.startTimer;
                    }

                    this.stageSprite.updateTime(timer);


                    //CHeck collision entre joueur
                    var orientation = this._mainPlayerCollisionStatus();

                    if(orientation == "COLLISION"){
                        this.mainPlayer.playerCollision = this.onlinePlayer;
                        this.onlinePlayer.playerCollision = this.mainPlayer;
                    }
                    else{
                        var orientationPlayer2 = (orientation == "RIGHT") ? "LEFT" : "RIGHT";
                        this.mainPlayer.setOrientation(orientation);
                        this.onlinePlayer.setOrientation(orientationPlayer2);
                        this.mainPlayer.playerCollision = false;
                        this.onlinePlayer.playerCollision = false;
                    }


                },
                _render: function () {
                    this._update();

                    this.stageSprite.render();
                    this.mainPlayer.render();
                    this.onlinePlayer.render();

                    var frameReq = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

                    frameReq(this._render.bind(this));
                },

                //Retourne "COLLISION", "LEFT" orienté à gauche, "RIGHT" sinon
                _mainPlayerCollisionStatus: function(){

                    var p1 = {
                        left: this.mainPlayer.x + 10,
                        right: this.mainPlayer.x + this.mainPlayer.sprite.clipWidth - 10,
                    };

                    var p2 = {
                        left: this.onlinePlayer.x + 10,
                        right: this.onlinePlayer.x + this.onlinePlayer.sprite.clipWidth - 10,
                    };


                    if(!(p2.left > p1.right || p2.right < p1.left )){
                        return "COLLISION";
                    }
                    else if(p1.right < p2.left){
                        return "RIGHT";
                    }
                    else{
                        return "LEFT";
                    }
                },
                _notifieServer: function(){
                    var data = this.mainPlayer.getMessage();
                    SocketService.then(function(SocketService) {
                        SocketService.emit('game.set.playerudpate', data);
                    });
                },
                //Custom events
                onInit:  function () {
                },
                onReady: function () {
                },
                onStart: function () {
                },
                onStop:  function () {
                },
                init: function (options) {

                    //Contexte
                    this.context = options.context;
                    this.tickRate = options.tickRate || 30;
                    this.height = options.stageHeight || GameConfig.stage.height || 300;
                    this.width = options.stageWidth || GameConfig.stage.width || 1000;

                    //Stage
                    this.stageSprite = new StageSprite({
                        context: this.context,
                        width: this.width,
                        height: this.height
                    });

                    //Position des éléments du stage
                    this._updateStagePosition();


                    //Player
                    var mainPlayerOrientation = options.mainPlayerOrientation || 'RIGHT';
                    var mainPlayerName = options.mainPlayerName || "PLAYER 1";
                    var onlinePlayerName = options.onlinePlayerName || "PLAYER 2";

                    var eventNotifieServer = new Event('notifieServer');

                    this.mainPlayer = new Player({
                        context: this.context,
                        name: mainPlayerName,
                        isOpponent: false,
                        stageSprite: this.stageSprite,
                        orientation: mainPlayerOrientation,
                        eventServer: eventNotifieServer,
                    });

                    this.onlinePlayer = new Player({
                        context: this.context,
                        name: onlinePlayerName,
                        isOpponent: true,
                        stageSprite: this.stageSprite,
                        orientation: mainPlayerOrientation == 'RIGHT' ? 'LEFT' : 'RIGHT'
                    });


                    var initialX = 100;
                    if(mainPlayerOrientation == 'RIGHT'){
                        this.mainPlayer.x = initialX;
                        this.onlinePlayer.x = this.width - this.onlinePlayer.sprite.clipWidth - initialX;
                    }
                    else{
                        this.onlinePlayer.x = initialX;
                        this.mainPlayer.x = this.width - this.mainPlayer.sprite.clipWidth - initialX;
                    }



                    window.addEventListener('notifieServer', this._notifieServer.bind(this), false);

                    var $this = this;
                    SocketService.then(function(SocketService) {
                        //Reception
                        var onServerNotification = function(data){
                            this.onlinePlayer.setMessage(data);
                        };

                        SocketService.on('game.get.playerudpate', onServerNotification.bind($this));
                    });


                    //Lancement
                    this.stageSprite.renderStage();

                    var frameReq = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                    frameReq(this._render.bind(this));

                    //Init terminé
                    this.onInit;
                    //window.addEventListener('resize', resizeCanvas);
                    window.addEventListener('keypress', this._onKeyPress.bind(this), false);
                    window.addEventListener('keyup', this._onKeyRelease.bind(this), false);

                },
                destroy: function(){
                    window.removeEventListener('keypress', this._onKeyPress.bind(this), false);
                    window.removeEventListener('keyup', this._onKeyRelease.bind(this), false);
                    window.removeEventListener('notifieServer', this._notifieServer.bind(this), false);
                }
            };


            return game;
        };



        var factory = {};
        factory.game = null;


        factory.createNewGame = function(options){
            if(this.game === null){
                this.game = getNewGame();
                this.game.init(options);
            }
        };

        factory.destroyGame = function(){
            if(this.game !== null){
                this.game.destroy();
                this.game = null;
            }
        };


        return factory;
    }]);


    //Jeu
    app.directive('gameCanvas', ['$state', 'Flash', 'GameFactory', 'SocketService',
        function ($state, Flash, GameFactory, SocketService) {
            "use strict";
            return {
                restrict: 'E',
                replace:  true,
                scope:    {},
                template: "<canvas id='game_canvas' width='960' height='400'></canvas>",
                link:     function (scope, element, attribute) {

                    /**
                     * DEBUG TODO SUPPR
                     */

                    /*var canvas = element[0];
                    var context = canvas.getContext('2d');
                    GameFactory.createNewGame({
                        context: context,
                        stageHeight: 350,
                        mainPlayerOrientation: 'LEFT'
                    });*/


                    //Initialisation du jeu
                    //Socket sur le serveur pour annoncer qu'on est pret, en attente d'une réponse
                    SocketService.then(function(SocketService) {

                        var canvas = element[0];
                        var context = canvas.getContext('2d');


                        SocketService.emit('game.ready', {});

                        SocketService.on('game.ready', function(data){
                            GameFactory.createNewGame({
                                context: context,
                                stageHeight: 350,
                                mainPlayerOrientation: data.type
                            });
                        });


                        SocketService.on('game.abort', function(data){
                            Flash.create('danger', data);
                            $state.go('compte.lobby');
                        });




                        //Reception
                        var endGame = function(data){

                            console.log(data);
                            //On supprime le jeu
                            GameFactory.destroyGame();

                            if(data.win){
                                var message = "Starfoulah ! T'as gagné 10 trophées frère ! Psartek !";
                                alert('Vous avez gagné ! Pas le temps de faire une belle animation. Vous vous contentrez d\'une alerte');
                            }
                            else{
                                var message = "Vous avez perdu 10 trophés. C'est nul de perdre.";
                                alert('Tu as perdu Babtou fragile.');
                            }

                            Flash.create('info', message);
                            $state.go('compte.lobby');
                        };

                        SocketService.on('game.end', endGame);

                        //SocketService.on('game.get.playerudpate', onServerNotification.bind($this));
                    });


                }//Fin Directive
            };
        }]);




    /*
    function NULNULNUL(){




        var canvas = element[0];
        var context = canvas.getContext('2d');




        function Stage(context){

            var $this = this;
            this.width = 1000;
            this.height = 300;
            this.context = context;
            this.totalWidth = window.innerWidth;
            this.totalHeight = window.innerHeight;
            this.x = (this.totalWidth - this.width) / 2;
            this.y = (this.totalHeight - this.height) / 2;

            this.player1;
            this.player2;

            var eventNotifieServer = new Event('notifieServer');




            this.update = function(){
                var orientation = getOrientationPlayer(this.player1, this.player2);

                if(orientation == "COLLISION"){
                    this.player1.playerCollision = this.player2;
                    this.player2.playerCollision = this.player1;
                }
                else{
                    var orientationPlayer2 = (orientation == "RIGHT") ? "LEFT" : "RIGHT";
                    this.player1.setOrientation(orientation);
                    this.player2.setOrientation(orientationPlayer2);
                    this.player1.playerCollision = false;
                    this.player2.playerCollision = false;
                }
            }


            this.render = function(){
                this.update();

                //this.setDimensions();

                this.player1.render();
                this.player2.render();
            };



            //Player
            this.player1 = new Player(context, "PLAYER1", false, this.x, this.y, this.width, this.height);
            this.player2 = new Player(context, "PLAYER2", true, this.x, this.y, this.width, this.height);
            this.player1.eventServer = eventNotifieServer;


            this.player1.x = 100;
            this.player2.x = 900;
            this.player1.y = 200;
            this.player2.y = 200;



            var keydown = function(event){
                $this.player1.bindKey(event.keyCode, "down");
            };

            var keyrelease = function(event){
                $this.player1.bindKey(event.keyCode, "release");
            };

            var keypress = function(event){
                $this.player1.bindKey(event.charCode, "press");
            };


            //this.setDimensions();







            SocketService.then(function(SocketService) {

                //Emission
                var notifieServer = function(){
                    var data = $this.player1.getMessage();
                    SocketService.emit('game.set.playerudpate', data);
                };

                window.addEventListener('notifieServer', notifieServer, false);


                //Reception
                var onServerNotification = function(data){
                    $this.player2.setMessage(data);
                };

                SocketService.on('game.get.playerudpate', onServerNotification);
                SocketService.on('game.user.deconnected', function(){
                    alert('Joueur déconnecté');
                });

            });

            window.addEventListener('keydown', keydown, false);
            window.addEventListener('keyup', keyrelease, false);


            //window.addEventListener('resize', setDimensions);
        }

        var stage = new Stage(context);

        function gameLoop () {

            //window.requestAnimationFrame(gameLoop);
            //requestAnimationFrame(gameLoop);
            //context.clearRect(0, 0, context.canvas.width, context.canvas.height);

            stage.render();

        }


        var pauseGame = function(){
            clearInterval(interval);
        };

        var playGame = function(){
            interval = setInterval(gameLoop, 1000/30);
        };

        playGame();



        //init
        var resizeCanvas = function(){
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

        };


        resizeCanvas();

        //window.addEventListener('keypress', keypress, false);
        //window.addEventListener('blur', pauseGame, false);
        //window.addEventListener('focus', playGame, false);
        window.addEventListener('resize', resizeCanvas);







    }


*/





}());