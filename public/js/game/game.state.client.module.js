/**
 * Created by Jérémie Quinson on 17/05/15.
 */
(function () {
    'use strict';

    //Module UI
    var app = angular.module('SFGame.UI');


    /**
     * Construction des état d'un player.
     * Chaque état fournis différentes transitions possibles (déclenchées par des touches ou autres type d'évents)
     * Un état gère également la lecture d'un évènement
     */
    app.factory('StateFactory', ['GameConfig', 'SpriteFactory', function(GameConfig, SpriteFactory){

        var factory = {};

        //Constantes
        factory.STATE_IDLE = "IDLE";
        factory.STATE_JUMP = "JUMP";
        factory.STATE_FALL = "FALL";
        factory.STATE_LEFT = "LEFT";
        factory.STATE_RIGHT = "RIGHT";
        factory.STATE_CROUCH = "CROUCH";
        factory.STATE_PUNCH = "PUNCH";
        factory.STATE_KICK = "KICK";
        factory.STATE_SPECIAL = "SPECIAL";
        factory.STATE_YOLO = "YOLO";


        //Utils
        var isKeyDown = function(key, key2, type){
            return type == 'down' && key == key2;
        };

        var isKeyRelease = function(key, key2, type){
            return type == 'release' && key == key2;
        };



        var subArrayInArray = function(sub, arr){
            for(var index in sub){
                if(arr[index] != sub[index]){
                    return false;
                }
            };

            return true;
        };




        var getCoupSpecial = function(combinedKeys){



            if(combinedKeys.length == 0){
                return null;
            }

            if(!subArrayInArray(combinedKeys, GameConfig.keymap.KEY_SPECIAL) && !subArrayInArray(combinedKeys, GameConfig.keymap.KEY_SPECIALK)){
                combinedKeys.shift();
                getCoupSpecial(combinedKeys);
            }
            else if(subArrayInArray(combinedKeys, GameConfig.keymap.KEY_SPECIALK) && combinedKeys.length == GameConfig.keymap.KEY_SPECIALK.length){
                return factory.STATE_YOLO;
            }
            else if(subArrayInArray(combinedKeys, GameConfig.keymap.KEY_SPECIAL) && combinedKeys.length == GameConfig.keymap.KEY_SPECIAL.length){
                return factory.STATE_SPECIAL;
            }
            else{
                return null
            }



            //if(subArrayInArray())


            return null;
         }



        var changeStateOnMove = function(player){
            //Si déplacement droit
            if(player.pressedKeys[GameConfig.keymap.KEY_RIGHT]){
                player.changeState(new StateRIGHT());
            }
            //Si déplacement gauche
            else if(player.pressedKeys[GameConfig.keymap.KEY_LEFT]){
                player.changeState(new StateLEFT());
            }
            //sinon
            else{
                player.changeState(new StateIDLE());
            }
        }


        //Classe State
        //Stocke le joueur, initialise une variable animation
        function State(player){
            this.damageTop = 0;
            this.damageBottom = 0;
            this.protectedTop = false;
            this.protectedBottom = false;
            this.stateName = 'NONE';
        }






        //Classe StateIDLE
        //Stocke le joueur, initialise une variable animation
        function StateIDLE(){
            State.apply(this, arguments);
            this.stateName = factory.STATE_IDLE;
        }

        StateIDLE.prototype = Object.create(State.prototype);


        //Evenement Clés
        StateIDLE.prototype.handleKey = function(player, key, type){
            console.log("IDLE Key = ", key, type);

            var keymap = GameConfig.keymap;

            var coupSpecial = getCoupSpecial(player.combinedKeys);

            console.log(coupSpecial);
            if(coupSpecial == factory.STATE_SPECIAL){
                player.changeState(new StateSPECIAL(player));
                return;
            }
            else if(coupSpecial == factory.STATE_YOLO){
                player.changeState(new StateYOLO(player));
                return;
            }

            //TODO : Vérifier spécial Attack

            switch (true) {
                //Jump
                case isKeyDown(key, keymap.KEY_JUMP, type):
                    player.changeState(new StateJUMP(player));
                    break;

                //Crouch
                case isKeyDown(key, keymap.KEY_CROUCH, type):
                    player.changeState(new StateCROUCH(player));
                    break;

                //PUNCH
                case isKeyDown(key, keymap.KEY_PUNCH, type):
                    player.changeState(new StatePUNCH(player));
                    break;

                //KICK
                case isKeyDown(key, keymap.KEY_KICK, type):
                    player.changeState(new StateKICK(player));
                    break;

                //KICK
                case isKeyDown(key, keymap.KEY_LEFT, type):
                    player.changeState(new StateLEFT(player));
                    break;

                //KICK
                case isKeyDown(key, keymap.KEY_RIGHT, type):
                    player.changeState(new StateRIGHT(player));
                    break;
            };
        };


        //Lance l'état
        StateIDLE.prototype.go = function(player){
            console.log(this.stateName);

            player.velocityX = 0;
            player.velocityY = 0;

            player.sprite.gotoAndPlay('idle');
        };





        //Classe StateJUMP
        function StateJUMP(){
            State.apply(this, arguments);
            this.stateName = factory.STATE_JUMP;
            this.protectedBottom = true;
        }

        StateJUMP.prototype = Object.create(State.prototype);

        //Evenement Clés
        StateJUMP.prototype.handleKey = function(player, key, type){};

        //Lance l'état
        StateJUMP.prototype.go = function(player){
            console.log(this.stateName);

            player.velocityY = - GameConfig.physics.velocity.jump;
            player.sprite.gotoAndPlay('jump', function(){
                player.changeState(new StateFALL());
            });
        };




        //Classe FALL hérite de JUMP pour les evenemen clavier
        function StateFALL(){
            State.apply(this, arguments);
            this.stateName = factory.STATE_FALL;
            this.protectedBottom = true;
        }

        StateFALL.prototype = Object.create(State.prototype);

        //Evenement Clés
        StateFALL.prototype.handleKey = function(player, key, type){};

        //Lance l'état
        StateFALL.prototype.go = function(player){

            //Lance l'animation, à la fin de l'animation, l'état redevient IDLE
            player.velocityY = +GameConfig.physics.velocity.jump;

            player.sprite.gotoAndPlay('fall', function(){
                player.velocityY = 0;
                player.y = player.maxY;
                changeStateOnMove(player);
                //player.changeState(new StateIDLE());

            });

        };



        //Classe StateLEFT
        function StateLEFT(player){
            State.apply(this, arguments);
            this.stateName = factory.STATE_LEFT;
        }

        StateLEFT.prototype = Object.create(State.prototype);

        //Evenement Clés
        StateLEFT.prototype.handleKey = function(player, key, type){

            var coupSpecial = getCoupSpecial(player.combinedKeys);

            if(coupSpecial == factory.STATE_SPECIAL){
                player.changeState(new StateSPECIAL(player));
                return;
            }
            else if(coupSpecial == factory.STATE_YOLO){
                player.changeState(new StateYOLO(player));
                return;
            }

            var keymap = GameConfig.keymap;
            switch (true) {
                //Jump
                case isKeyDown(key, keymap.KEY_JUMP, type):
                    player.changeState(new StateJUMP());
                    break;

                //Crouch
                case isKeyDown(key, keymap.KEY_CROUCH, type):
                    player.changeState(new StateCROUCH());
                    break;

                //PUNCH
                case isKeyDown(key, keymap.KEY_PUNCH, type):
                    player.changeState(new StatePUNCH());
                    break;

                //KICK
                case isKeyDown(key, keymap.KEY_KICK, type):
                    player.changeState(new StateKICK());
                    break;

                //KICK
                case isKeyRelease(key, keymap.KEY_LEFT, type):
                    player.changeState(new StateIDLE());
                    break;

                //KICK
                case isKeyDown(key, keymap.KEY_RIGHT, type):
                    player.changeState(new StateRIGHT());
                    break;
            };

        };

        //Lance l'état
        StateLEFT.prototype.go = function(player){
            console.log(this.stateName);

            if(player.orientation == 'LEFT'){
                player.velocityX = - GameConfig.physics.velocity.move;
                this.animation = "move";
            }
            else{
                player.velocityX = - GameConfig.physics.velocity.back;
                this.animation = "back";
            }

            player.sprite.gotoAndPlay(this.animation);
        };



        //Classe StateRIGHT
        function StateRIGHT(player){
            State.apply(this, arguments);
            this.stateName = factory.STATE_RIGHT;
        }

        StateRIGHT.prototype = Object.create(State.prototype);

        //Evenement Clés
        StateRIGHT.prototype.handleKey = function(player, key, type){

            var coupSpecial = getCoupSpecial(player.combinedKeys);

            if(coupSpecial == factory.STATE_SPECIAL){
                player.changeState(new StateSPECIAL(player));
                return;
            }
            else if(coupSpecial == factory.STATE_YOLO){
                player.changeState(new StateYOLO(player));
                return;
            }

            var keymap = GameConfig.keymap;
            switch (true) {
                //Jump
                case isKeyDown(key, keymap.KEY_JUMP, type):
                    player.changeState(new StateJUMP());
                    break;

                //Crouch
                case isKeyDown(key, keymap.KEY_CROUCH, type):
                    player.changeState(new StateCROUCH());
                    break;

                //PUNCH
                case isKeyDown(key, keymap.KEY_PUNCH, type):
                    player.changeState(new StatePUNCH());
                    break;

                //KICK
                case isKeyDown(key, keymap.KEY_KICK, type):
                    player.changeState(new StateKICK());
                    break;

                //KICK
                case isKeyDown(key, keymap.KEY_LEFT, type):
                    player.changeState(new StateLEFT());
                    break;

                //KICK
                case isKeyRelease(key, keymap.KEY_RIGHT, type):
                    player.changeState(new StateIDLE());
                    break;
            };
        };

        //Lance l'état
        StateRIGHT.prototype.go = function(player){
            console.log(this.stateName);

            if(player.orientation == 'RIGHT'){
                player.velocityX = GameConfig.physics.velocity.move;
                this.animation = "move";
            }
            else{
                player.velocityX = GameConfig.physics.velocity.back;
                this.animation = "back";
            }

            player.sprite.gotoAndPlay(this.animation);
        };




        //Classe StateCROUCH
        function StateCROUCH(player){
            State.apply(this, arguments);
            this.protectedTop = true;
            this.stateName = factory.STATE_CROUCH;
        }

        StateCROUCH.prototype = Object.create(State.prototype);

        //Evenement Clés
        StateCROUCH.prototype.handleKey = function(player, key, type){

            var keymap = GameConfig.keymap;
            switch (true){
                case isKeyRelease(key, keymap.KEY_CROUCH, type):
                    player.changeState(new StateIDLE());
                    break;
            };
        };

        //Lance l'état
        StateCROUCH.prototype.go = function(player){
            console.log(this.stateName);

            player.velocityX = 0;
            player.velocityY = 0;

            //Lance l'animation, à la fin de l'animation, l'état redevient IDLE
            player.sprite.gotoAndPlay('crouch');
        };





        //Classe StateIDLE
        //Stocke le joueur, initialise une variable animation
        function StateATTACK(player){
            State.apply(this, arguments);
            this.stateName = 'ATTACK';
            this.animation = false;
        }

        StateATTACK.prototype = Object.create(State.prototype);

        //Evenement Clés
        StateATTACK.prototype.handleKey = function(player, key, type){};

        //Lance l'état
        StateATTACK.prototype.go = function(player){
            console.log(this.stateName);

            player.attack();

            if(!this.animation){
                console.error("Aucune animation fournie pour l'état StateATTACK");
                return;
            }

            player.velocityX = 0;

            //Lance l'animation, à la fin de l'animation, l'état redevient IDLE
            player.sprite.gotoAndPlay(this.animation, function(){
                player.changeState(new StateIDLE());
            });
        };



        //Attack
        function StatePUNCH(player){
            StateATTACK.apply(this, arguments);
            this.stateName = factory.STATE_PUNCH;
            //this.animation = "punch";
            this.animation = "punch";
            this.damageTop = GameConfig.fight.damagePunch;
        }

        StatePUNCH.prototype = Object.create(StateATTACK.prototype);







        //Attack
        function StateKICK(player){
            StateATTACK.apply(this, arguments);
            this.stateName = factory.STATE_KICK;
            this.animation = "kick";
            this.damageBottom = GameConfig.fight.damageKick;

        }

        StateKICK.prototype = Object.create(StateATTACK.prototype);



        //Attack
        function StateSPECIAL(player){
            StateATTACK.apply(this, arguments);
            this.stateName = factory.STATE_SPECIAL;
            this.animation = "special";
            this.damageTop = 0;
            this.damageBottom = GameConfig.fight.damageSpecial;
        }

        StateSPECIAL.prototype = Object.create(StateATTACK.prototype);


        //Attack
        function StateYOLO(player){
            StateATTACK.apply(this, arguments);
            this.stateName = factory.STATE_YOLO;
            this.animation = "yolo";
            this.damageTop = GameConfig.fight.damageYolo;
            this.damageBottom = 0;
        }

        StateYOLO.prototype = Object.create(StateATTACK.prototype);

        StateYOLO.prototype.go = function(player){
            console.log(this.stateName);

            player.attack();

            player.velocityX = 0;

            //Lance l'animation, à la fin de l'animation, l'état redevient IDLE
            player.setSpriteYolo();
            player.sprite.gotoAndPlay(this.animation, function(){
                player.removeYoloSprite();
                player.changeState(new StateIDLE());
            });
        };


        factory.getInstance = function(statename){
            switch(statename){

                case factory.STATE_IDLE:
                    return new StateIDLE();
                    break;

                case factory.STATE_JUMP:
                    return new StateJUMP();
                    break;

                case factory.STATE_FALL:
                    return new StateFALL();
                    break;

                case factory.STATE_CROUCH:
                    return new StateCROUCH();
                    break;

                case factory.STATE_LEFT:
                    return new StateLEFT();
                    break;

                case factory.STATE_RIGHT:
                    return new StateRIGHT();
                    break;

                case factory.STATE_PUNCH:
                    return new StatePUNCH();
                    break;

                case factory.STATE_KICK:
                    return new StateKICK();
                    break;

                case factory.STATE_SPECIAL:
                    return new StateSPECIAL();
                    break;

                case factory.STATE_YOLO:
                    return new StateYOLO();
                    break;

                default:
                    return false;
                    break;
            };
        };

        return factory;
    }]);





}());