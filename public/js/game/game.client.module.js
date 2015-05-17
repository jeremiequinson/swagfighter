/**
 * Created by Jérémie Quinson on 15/05/15.
 */
(function () {
    'use strict';

    var app = angular.module('SFGame', [
        'SFGame.UI'
    ]);


    //Jeu
    app.directive('gameCanvas', ['Player', 'SocketService', function (Player, SocketService) {
        "use strict";
        return {
            restrict: 'E',
            replace:  true,
            scope:    {},
            template: "<canvas id='game_canvas' width='960' height='400'></canvas>",
            link:     function (scope, element, attribute) {

                /*var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                                                */



                function Game(){

                }


                var interval = null;
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

                    //Retourne "COLLISION", "LEFT" orienté à gauche, "RIGHT" sinon
                    var getOrientationPlayer = function(player1, player2){

                        var p1 = {
                            left: player1.x + 10,
                            right: player1.x + player1.sprite.clipWidth - 10,
                        };

                        var p2 = {
                            left: player2.x + 10,
                            right: player2.x + player2.sprite.clipWidth - 10,
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
                    };



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
                        this.context.fillStyle="#000000";
                        this.context.rect(this.x, this.y, this.width, this.height);
                        this.context.fillStyle="#F7F7F7";
                        this.context.fillRect(this.x + 1, this.y +1 , this.width - 2, this.height -2);

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

                    });

                    window.addEventListener('keydown', keydown, false);
                    window.addEventListener('keyup', keyrelease, false);


                    //window.addEventListener('resize', setDimensions);
                }

                var stage = new Stage(context);

                function gameLoop () {

                    //window.requestAnimationFrame(gameLoop);
                    //requestAnimationFrame(gameLoop);
                    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

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
        };
    }]);








}());