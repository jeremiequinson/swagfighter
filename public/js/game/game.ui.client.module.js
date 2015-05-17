/**
 * Module UI
 */
(function () {
    'use strict';

    var app = angular.module('SFGame.UI', []);


    app.service('GameConfig', [ function(){

        var GameConfig = {};

        GameConfig.keymap = {};

        GameConfig.keymap.KEY_JUMP = 90; //Z
        GameConfig.keymap.KEY_CROUCH = 83; //S
        GameConfig.keymap.KEY_LEFT = 81; //Q
        GameConfig.keymap.KEY_RIGHT = 68; //D
        GameConfig.keymap.KEY_PUNCH = 65; //A
        GameConfig.keymap.KEY_KICK = 69; //E

        GameConfig.keymap.KEY_JUMP_CHARS = {
            122: GameConfig.keymap.KEY_JUMP,
            115: GameConfig.keymap.KEY_CROUCH,
            113: GameConfig.keymap.KEY_LEFT,
            100: GameConfig.keymap.KEY_RIGHT,
            91: GameConfig.keymap.KEY_PUNCH,
            101: GameConfig.keymap.KEY_KICK
        };


        //Coup spécial 1
        GameConfig.keymap.KEY_SPECIAL = [
            GameConfig.keymap.KEY_JUMP,
            GameConfig.keymap.KEY_JUMP,
            GameConfig.keymap.KEY_CROUCH,
            GameConfig.keymap.KEY_CROUCH
        ];

        //Coup spécial 2
        GameConfig.keymap.KEY_SPECIALK = [
            GameConfig.keymap.KEY_LEFT,
            GameConfig.keymap.KEY_RIGHT,
            GameConfig.keymap.KEY_LEFT,
            GameConfig.keymap.KEY_RIGHT
        ];


        //Données sur les mouvements
        GameConfig.physics = {
            velocity: {
                move: 6,
                back: 3,
                jump: 2,
                attackMove: 2
            }
        };






        return GameConfig;
    }]);


    app.factory('Sprite', [ function() {

        //Sprite
        function Sprite(options) {

            /**
             * Option model
             * options = {
             *   name: ,
             *   context: ,
             *   clipWidth: ,
             *   clipHeight: ,
             *   image: ,
             *   x: ,
             *   y: ,
             *   ticksPerFrame: ,
             *   animations: ,
             * }
             */

            var $this = {},
                frameIndex = 0,
                tickCount = 0;

            $this.name = options.name || "unamed Sprite";
            $this.context = options.context;
            $this.clipWidth = options.clipWidth || 0;
            $this.clipHeight = options.clipHeight || 0;
            $this.image = options.image;
            $this.x = options.x || 0;
            $this.y = options.y || 0;

            //Gestion de l'Animation
            //animation [clipX, clipY, nbFrame, animation, tickPerFrame]
            $this.ticksPerFrame = options.ticksPerFrame || 0; //
            $this.animations = options.animations || {};
            $this.currentAnimation = [];

            //Position de départ de l'animation
            $this.clipX = 0;
            $this.clipY = 0;
            $this.firstFrame = 0;
            $this.lastFrame = 0;
            //$this.numberOfFrames = 0;
            $this.loop = false;
            $this.nextAnimation = false;
            $this.running = true;
            $this.callbacks = {};
            $this.onAnimationEnd = function(){};

            //Gère le compte de frame
            var update = function () {

                //Si le sprite est stoppé
                /*if(!$this.running){
                    return false;
                }*/

                //Comptage
                tickCount += 1;

                var isReverse = $this.firstFrame > $this.lastFrame;

                //Le rate de base est environ 60 ticks/secondes. Lorsque le décompte dépasse le nombre de tick par frame, on passe la frame suivante
                if (tickCount > $this.ticksPerFrame) {
                    tickCount = 0;

                    var isOut = (!isReverse && frameIndex >= $this.lastFrame) || (isReverse && frameIndex <= $this.lastFrame);

                    //Si on dépasse le nombre de frame, on lance l'animation suivante, sinon on stop l'animation
                    if(isOut){

                        //C'est la fin de l'animtion
                        //$this.callbacks.onAnimationEnd();
                        $this.onAnimationEnd();

                        //On lance l'animation suivante si il y en a une, sinon on stop
                        if($this.nextAnimation){
                            $this.gotoAndPlay($this.nextAnimation);
                        }
                        /*else{
                            $this.stop();
                        }*/
                    }
                    else{
                        //Sinon on passe à la frame suivante
                        if(isReverse){
                            frameIndex -= 1;
                        }
                        else{
                            frameIndex += 1;
                        }
                    }
                }
            };




            //Stop animation
            $this.stop = function(){
                $this.running = false;
                //$this.callbacks.onAnimationStop();
            };

            //Jouer le clip
            $this.play = function(){
                $this.running = true;
                //$this.callbacks.onAnimationStart();
            };

            //Changer et lancer une animation
            $this.gotoAndPlay = function(animationName, callbacks){
                $this.running = true;
                $this.goto(animationName, callbacks);
            };

            //Changer et stopper une animation
            /*
            $this.gotoAndStop = function(animationName, callbacks){
                $this.running = false;
                $this.goto(animationName, callbacks);
            };*/


            //Merge la liste des callback par défaut avec les callbacks spécifiés
            var mergeCallbacks = function(callbacks){
                if(!callbacks){
                    callbacks = {};
                }



                //Merge
                var c = {
                    onAnimationStart: callbacks.onAnimationStart || function(){},
                    onAnimationStop: callbacks.onAnimationStop || function(){},
                };


                if(typeof(callbacks.onAnimationEnd) === 'function'){

                    c.onAnimationEnd = callbacks.onAnimationEnd;
                }
                else{
                    c.onAnimationEnd = function(){};

                }

                return c;
            }

            //Changer d'animation.
            $this.goto = function(animationName, callback){

                var animation = $this.animations[animationName];

                //Si l'animation n'existe pas, on ecrit une erreur et on quitte la fonction
                if(!animation){
                    console.error("L'animation " + animationName + " n'existe pas pour le sprite " + $this.name);
                    return false;
                }

                //On bind la nouvelle animation
                //$this.clipX = animation[0] * $this.clipWidth;
                $this.firstFrame = animation[0];
                $this.lastFrame = animation[1];
                $this.clipY = animation[2] * $this.clipHeight;
                //$this.numberOfFrames = animation[2];
                $this.nextAnimation = animation[3] || false;
                $this.ticksPerFrame = animation[4] || 0;
                $this.currentAnimation = animationName;
                $this.onAnimationEnd = callback || function(){};
                //$this.callbacks = mergeCallbacks(callbacks);


                //Reset des frames
                tickCount = 0;
                frameIndex = $this.firstFrame;

                //console.log($this.firstFrame, $this.lastFrame, $this.currentAnimation);

                //Au prochain update, l'animation commencera si l'animation est lancée
            }



            //Dessine le sprite.
            $this.render = function (x, y) {

                //On met à jour a frame
                update();

                //context.clearRect(position.x, position.y, width, height);

                //Position données en paramètre
                if(x){$this.x = x;}
                if(y){$this.y = y;}

                //test collision
                /*
                $this.context.fillRect(
                    $this.x,
                    $this.y,
                    $this.clipWidth,
                    $this.clipHeight
                );*/


                //Dessine l'image avec les nouvelles position
                $this.context.drawImage(
                    $this.image,
                    frameIndex * $this.clipWidth + $this.clipX,
                    $this.clipY,
                    $this.clipWidth,
                    $this.clipHeight,
                    $this.x,
                    $this.y,
                    $this.clipWidth,
                    $this.clipHeight
                );
            };

            return $this;
        };



        return (Sprite);
    }]);



    app.factory('SpriteFactory', ['Sprite', function(Sprite){

        var $this = {};
        //spriteplayer.png

        var playerImage = new Image();
        playerImage.src = "../../img/game/spriteplayer.png";

        var playerImageReverse = new Image();
        playerImageReverse.src = "../../img/game/spriteplayerreverse.png";

        var yoloImage = new Image();
        yoloImage.src = "../../img/game/yolo.png";

        var animationsNormal = {
            //[clipX, clipY, nbFrame, animation, tickPerFrame]
            'idle':     [0, 3, 1, 'idle', 2],
            'jump':     [0, 3, 8, false, 2],
            'fall':     [3, 6, 8, false, 2],
            'punch':    [0, 2, 2, false, 2],
            'kick':     [0, 4, 6, false, 2],
            'special':  [0, 4, 7, false, 2],
            'move':     [0, 2, 3, 'move', 2],
            'back':     [4, 2, 3, 'back', 2],
            'crouch':   [0, 0, 9, 'crouch', 2],
            'yolo':     [0, 6, 10, false, 2],
        };


        var animationsReverse = {
            'idle':     [6, 3, 1, 'idle', 2],
            'jump':     [6, 3, 8, false, 2],
            'fall':     [3, 0, 8, false, 2],
            'punch':    [6, 4, 2, false, 2],
            'kick':     [6, 2, 6, false, 2],
            'special':  [6, 2, 7, false, 2],
            'move':     [6, 4, 3, 'move', 2],
            'back':     [2, 4, 3, 'back', 2],
            'crouch':   [6, 6, 9, 'crouch', 2],
            'yolo':     [6, 0, 10, false, 2],
        };


        var animationsYolo = {
            'normal':     [0, 2, 0, 'normal', 1],
        };


        $this.getAnimations = function(reverse){
            return reverse ? animationsReverse : animationsNormal;
        };

        $this.getPlayerImage = function(reverse){
            return reverse ? playerImageReverse : playerImage ;
        }




        $this.getSpritePlayer = function(context, name, reverse){

            return new Sprite({
                name: name || "Player",
                context: context,
                clipWidth: 70,
                clipHeight: 80,
                image: reverse ? playerImageReverse : playerImage,
                ticksPerFrame: 0,
                animations: reverse ? animationsReverse : animationsNormal
            });
        };


        $this.getSpriteYolo = function(context){

            return new Sprite({
                name: "yolo",
                context: context,
                clipWidth: 365,
                clipHeight:200,
                image: yoloImage,
                ticksPerFrame: 0,
                animations: animationsYolo
            });
        };

        return $this;

    }]);



    app.factory('StateFactory', ['GameConfig', 'SpriteFactory', function(GameConfig, SpriteFactory){

        var factory = {};

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
/*
        var isCoupSpecial = function(combinedKeys){

            var specIndex = 0;
            for(var index = 0; combinedKeys[index] !== undefined; index++){
                var code = combinedKeys[index];

                //Si la compbinaison ne correspond à rien, on supprime tous les éléments avant
                if(GameConfig.keymap.KEY_SPECIAL[index] != code && GameConfig.keymap.KEY_SPECIALK[index] != code){
                    combinedKeys.splice(0, index+1);
                }
            }


        }*/
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

            //player.velocityX = 5;
            //player.velocityY = 0;
            if(player.velocityX > 0){
                player.velocityX = GameConfig.physics.velocity.attackMove;
            }
            else if(player.velocityX < 0){
                player.velocityX = - GameConfig.physics.velocity.attackMove;
            }

            //Lance l'animation, à la fin de l'animation, l'état redevient IDLE
            var $this = this;
            player.sprite.gotoAndPlay(this.animation, function(){
                //player.changeState(new StateIDLE());
                changeStateOnMove(player);
            });
        };



        //Attack
        function StatePUNCH(player){
            StateATTACK.apply(this, arguments);
            this.stateName = factory.STATE_PUNCH;
            //this.animation = "punch";
            this.animation = "yolo";


            this.damageTop = 5;
        }

        StatePUNCH.prototype = Object.create(StateATTACK.prototype);

        StatePUNCH.prototype.go = function(player){
            console.log(this.stateName);

            player.attack();

            if(player.velocityX > 0){
                player.velocityX = GameConfig.physics.velocity.attackMove;
            }
            else if(player.velocityX < 0){
                player.velocityX = - GameConfig.physics.velocity.attackMove;
            }

            //Lance l'animation, à la fin de l'animation, l'état redevient IDLE
            player.setSpriteYolo();
            player.sprite.gotoAndPlay(this.animation, function(){
                //player.changeState(new StateIDLE());
                player.removeYoloSprite();
                changeStateOnMove(player);
            });
        };





        //Attack
        function StateKICK(player){
            StateATTACK.apply(this, arguments);
            this.stateName = factory.STATE_KICK;
            this.animation = "kick";
            this.damageTop = 5;

        }

        StateKICK.prototype = Object.create(StateATTACK.prototype);



        //Attack
        function StateSPECIAL(player){
            StateATTACK.apply(this, arguments);
            this.stateName = factory.STATE_SPECIAL;
            this.animation = "special";
            this.damageTop = 10;
            this.damageBottom = 10;
        }

        StateSPECIAL.prototype = Object.create(StateATTACK.prototype);


        //Attack
        function StateYOLO(player){
            StateATTACK.apply(this, arguments);
            this.stateName = factory.STATE_YOLO;
            this.animation = "yolo";
            this.damageTop = 50;
            this.damageBottom = 50;
        }

        StateYOLO.prototype = Object.create(StateATTACK.prototype);



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




    app.factory('Player', ['SpriteFactory', 'StateFactory', 'GameConfig', function(SpriteFactory, StateFactory, GameConfig){


        function Player(context, name, isOpponent, stageX, stageY, stageW, stageH) {

            this.isOpponent = isOpponent;
            this.name = name;
            this.sprite = SpriteFactory.getSpritePlayer(context, name, this.isOpponent);
            this.context = context;
            this.orientation = this.isOpponent ? 'LEFT' : 'RIGHT';
            this.x = 0;
            this.y = 100;
            this.velocityX = 0;
            this.velocityY = 0;
            this.hp = 100;
            this.minY = 0;
            this.maxY = 100;
            this.pressedKeys = [];
            this.eventServer = false;
            this.stageX = stageX;
            this.stageY = stageY;
            this.combinedKeys = [];
            this.yolosprite;


            //Joueur collision
            this.collision = false;


            //Set yolo
            this.setSpriteYolo = function(){
                this.yolosprite = SpriteFactory.getSpriteYolo(this.context);
                this.yolosprite.x = this.x + this.sprite.clipWidth + this.stageX ;
                this.yolosprite.y = this.y - (this.yolosprite.clipHeight / 2) + (this.sprite.clipHeight / 2) + this.stageY;
                this.yolosprite.gotoAndPlay('normal');
            };

            //Set yolo
            this.removeYoloSprite = function(){
                this.yolosprite = undefined;
            };


            this.render = function () {
                this.update();

                if (this.sprite !== null) {
                    this.sprite.render(this.x + this.stageX, this.y + this.stageY);
                }

                this.context.font = '14px Arial';
                this.context.textAlign = 'center';
                this.context.fillStyle = '#AAA';

                var textWidth = this.context.measureText(this.name).width;


                var textX = this.sprite.x + (this.sprite.clipWidth / 2);
                var textY = this.sprite.y - 20;

                this.context.fillText(this.name, textX, textY);



                var x = (!isOpponent) ? 10 : 500;
                var y = (!isOpponent) ? 50 : 50;

                this.context.font="20px Georgia";
                this.context.fillText(this.name + " : " + this.hp + "/100", x, y);

                if(this.yolosprite !== undefined){
                    this.yolosprite.x = this.yolosprite.x + 10;
                    this.yolosprite.render();
                }

            };


            this.bindKey = function(code, type){

                //Récupère le code Key correspondant au code char
                if(type == 'press'){
                    if(GameConfig.keymap.KEY_JUMP_CHARS[code] !== undefined){
                        code = GameConfig.keymap.KEY_JUMP_CHARS[code];
                    }

                    type = "down";
                }

                //Conserve les touches
                if(type == "down"){
                    this.combinedKeys.push(code);
                    this.pressedKeys[code] = true;
                }
                else if(type == "release"){
                    this.pressedKeys[code] = false;
                }

                if(this.currentState){
                    this.currentState.handleKey(this, code, type);
                }
            };


            this.changeState = function(state){
                this.currentState = state;
                this.currentState.go(this);
                if(this.eventServer){
                    window.dispatchEvent(this.eventServer);
                }
            };


            //Mouvement
            this.update = function () {

                //MOuvement
                this.x += this.velocityX;
                this.y += this.velocityY;

                if(this.y < this.minY){
                    this.y = this.minY;
                }

                if(this.y > this.maxY){
                    this.y = this.maxY;
                }
                if(this.x < 0){
                    this.x = 0;
                }

                if(this.x > stageW){
                    this.x = stageW;
                }

            };

            //Action à effectuer à chaque attaque
            this.attack = function(){
                if(this.playerCollision){

                    //attaquant
                    var damageBottom = this.currentState.damageBottom;
                    var damageTop = this.currentState.damageTop;

                    //Défenseur
                    var protectedBottom = this.protectedBottom;
                    var protectedTop = this.protectedTop;



                }
            };


            //On définie l'orientation. Si elle est différente de l'orientation courante, on pivote le joueur
            this.setOrientation = function(orientation){
                if(this.isOpponent){
                    //console.log(this.orientation);
                }
                if(orientation != this.orientation){
                    this.reverse();
                    this.orientation = orientation;
                }
            }

            //On inverse le joueur
            this.reverse = function(){
                var reverse = this.orientation == "RIGHT";
                var image = SpriteFactory.getPlayerImage(reverse);
                var animations = SpriteFactory.getAnimations(reverse);




                //this.sprite.gotoAndPlay(this.sprite.currentAnimation);
                this.sprite.animations = animations;
                this.sprite.image = image;

                this.currentState = StateFactory.getInstance(this.currentState.stateName);
                this.currentState.go(this);
                //console.log(this.currentState);
            };


            //Retourne le message contenant les données à envoyer au serveur
            //Reverse toutes les positon
            this.getMessage = function(){
                var currentState = this.currentState.stateName;
                if(currentState == StateFactory.STATE_LEFT){
                    currentState = StateFactory.STATE_RIGHT;
                }
                else if(currentState == StateFactory.STATE_RIGHT){
                    currentState = StateFactory.STATE_LEFT;
                }

                return {
                    currentState: currentState,
                    x: this.x,
                    y: this.y,
                    velocityX: - this.velocityX,
                    velocityY: this.velocityY,
                    hp: this.hp
                };
            };

            //Retourne le message contenant les données du serveur à binder sur le joueur
            this.setMessage = function(data){

                var stateName = data.currentState,
                    x = data.x,
                    y = data.y,
                    velocityX = data.velocityX,
                    velocityY = data.velocityY,
                    hp = data.hp;

                var newState = StateFactory.getInstance(stateName);
                if(newState){
                    this.changeState(newState);
                }
                else{
                    console.error("State " + stateName + " invalid");
                }

            };




            this.currentState = StateFactory.getInstance(StateFactory.STATE_IDLE);
            this.currentState.go(this);

            //Test collision
            this.test = function(){

            }

        }


        return (Player);
    }]);

}());