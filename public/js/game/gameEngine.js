/**
 * Created by Jérémie Quinson on 14/05/15.
 */

    'use strict';


    const IDLE = "idle";
    const MOVE_LEFT = "moveleft";
    const MOVE_RIGHT = "moveright";
    const ATTACK_BOTTOM = "attackbottom";
    const ATTACK_TOP = "attacktop";
    const CROUCH = "crouch";
    const BLOCK = "block";
    const DIE = "die";
    const DIED = "died";
    const WIN = "win";

    //Applique des règles en fonction de l'état qu'on souhaite ajouter
    //Régles du type:
    //Etat incompatible = Cancel
    //Etat override = Supprime un ou plusieurs etat
    //Etat normal = Ajoute l'état point barre ! On est là !
    var applyStateRule = function(stateList, state){


        //TODO Rules

        //Si l'état n'est pas déjà dans la liste
        if(stateList.indexOf(state) === -1){
            stateList.push(state);
        }

        return stateList;
    };




//spriteplayer.gif
    //70/80
    //121/50













/*

    var SupFighter = {
        canvasContext: null,
        player: null,
        c: null,
        clock: null,
        keyDown: function(event){
            //bas 40
            //left 37
            //haut 38
            //right 39

            if(event.keyCode == 37){
                this.player.status = MOVE_LEFT;
            }
            else if(event.keyCode == 39){
                this.player.status = MOVE_RIGHT;
            }
        },
        keyUp: function(event){
            this.player.status = IDLE;
        },
        focus: function(event){
            console.log('focus');
            if(this.clock == null){
                this.clock = setInterval(this.update.bind(this), 1000 / 24);
            }
        },
        blur: function(event){

            if(this.clock != null){
                clearInterval(this.clock);
                this.clock = null;
            }

        },
        update: function(){

            this.c.clearRect(0, 0, this.canvasContext.width, this.canvasContext.height);

            this.player.move();

            this.player.render();


        },
        init: function(){

            var canvas = document.getElementById('game_canvas');
            canvas.width = 1000;
            canvas.height = 400;



            this.player = new sprite({
                context: canvas.getContext("2d"),
                width: 40,
                height: 60,
                image: characterImage
            });

            this.canvasContext = canvas;
            this.c = this.canvasContext.getContext('2d');


            window.addEventListener('keydown', this.keyDown.bind(this), false);
            window.addEventListener('keyup', this.keyUp.bind(this), false);
            window.addEventListener('focus', this.focus.bind(this), false);
            window.addEventListener('blur', this.blur.bind(this), false);
            //setInterval(this.update.bind(this), 1000 / 24);

        }
    }


    SupFighter.init();*/



