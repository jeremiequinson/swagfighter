/**
 * Created by Jérémie Quinson on 15/05/15.
 */
(function () {
    'use strict';

    var app = angular.module('SFGame', [
        'SFGame.UI'
    ]);


    //Jeu
    app.directive('gameCanvas', ['Player', function (Player) {
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

                var interval = null;
                var canvas = element[0];
                var context = canvas.getContext('2d');
                var player = new Player(context, "PLAYER1");
                var player2 = new Player(context, "PLAYER2");

                player2.x = 1000;

                var collision = function(player1, player2){

                    var r1position = {
                        left: player1.x + 10,
                        top: player1.y + 10,
                        right: player1.x + player1.sprite.clipWidth - 10,
                        bottom: player1.y + player1.sprite.clipHeight - 10,
                    };

                    var r2position = {
                        left: player2.x + 10,
                        top: player2.y + 10,
                        right: player2.x + player2.sprite.clipWidth - 10,
                        bottom: player2.y + player2.sprite.clipHeight- 10,
                    };

                    return !(r2position.left > r1position.right ||
                        r2position.right < r1position.left ||
                        r2position.top > r1position.bottom ||
                        r2position.bottom < r1position.top);
                };

                function gameLoop () {

                    //window.requestAnimationFrame(gameLoop);
                    //requestAnimationFrame(gameLoop);
                    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

                    player.render();
                    player2.render();

                    if(collision(player, player2)){
                        player.collision = player2;
                        player2.collision = player1;
                        console.log('COLLISION');
                    }
                    else{
                        player.collision = false;
                        player2.collision = false;
                    }
                }


                var keydown = function(event){
                    player.bindKey(event.keyCode, "down");
                };

                var keyrelease = function(event){
                    player.bindKey(event.keyCode, "release");
                };

                var pauseGame = function(){
                    clearInterval(interval);
                };

                var playGame = function(){
                    interval = setInterval(gameLoop, 1000/30);
                };






                //init
                var resizeCanvas = function(){
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                };

                resizeCanvas();
                window.addEventListener('keydown', keydown, false);
                window.addEventListener('keyup', keyrelease, false);
                //window.addEventListener('keypress', keydown, false);
                window.addEventListener('blur', pauseGame, false);
                window.addEventListener('focus', playGame, false);
                window.addEventListener('resize', resizeCanvas);




                playGame();
            }
        };
    }]);








}());