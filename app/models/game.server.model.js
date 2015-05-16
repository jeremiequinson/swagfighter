/**
 * Created by Jérémie Quinson on 14/05/15.
 */
(function () {
    'use strict';


    //New game
    //Gère les sockets pour le moteur de jeu, et les evenements liés au jeu
    function Game(userSocket1, userSocket2){

        this.player1 = userSocket1;
        this.player2 = userSocket2;
        this.id = this.player1.getSocketId() + this.player2.getSocketId();

        var $this = this;


        this.gameStart = function(){

        };

        this.gameEnd = function(){

        };




    }




    module.exports = Game;

}());