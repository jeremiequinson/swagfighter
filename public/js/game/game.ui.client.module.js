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
            97: GameConfig.keymap.KEY_PUNCH,
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


        //Configuration des parties
        GameConfig.fight = {
            maxHp: 100,
            damagePunch: 3,
            damageKick: 5,
            damageSpecial: 10,
            damageYolo: 10,
        };

        //Stage
        GameConfig.stage = {
            height: 300,
            width: 1000,
            color: '#ECDDC6',
            border: '#333333',
            fonts: {
                familly: "arial",
                size: '14px',
                color: '#333333'
            }
        };

        return GameConfig;
    }]);



    /**
     * Factory Sprite : Affichage d'un Sprite et animation
     */
    app.factory('Sprite', [ function() {

        //Sprite
        function Sprite(options) {

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
            $this.loop = false;
            $this.nextAnimation = false;
            $this.running = true;
            $this.callbacks = {};
            $this.onAnimationEnd = function(){};

            //Gère le compte de frame
            var update = function () {

                //Comptage
                tickCount += 1;

                var isReverse = $this.firstFrame > $this.lastFrame;

                //Le rate de base est environ 60 ticks/secondes. Lorsque le décompte dépasse le nombre de tick par frame, on passe la frame suivante
                if (tickCount > $this.ticksPerFrame) {
                    tickCount = 0;

                    var isOut = (!isReverse && frameIndex >= $this.lastFrame) || (isReverse && frameIndex <= $this.lastFrame);

                    //Si on dépasse le nombre de frame, on lance l'animation suivante, sinon on stop l'animation
                    if(isOut){

                        $this.onAnimationEnd();

                        //On lance l'animation suivante si il y en a une, sinon on stop
                        if($this.nextAnimation){
                            $this.gotoAndPlay($this.nextAnimation);
                        }
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
            };

            //Jouer le clip
            $this.play = function(){
                $this.running = true;
            };

            //Changer et lancer une animation
            $this.gotoAndPlay = function(animationName, callbacks){
                $this.running = true;
                $this.goto(animationName, callbacks);
            };


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
                $this.nextAnimation = animation[3] || false;
                $this.ticksPerFrame = animation[4] || 0;
                $this.currentAnimation = animationName;
                $this.onAnimationEnd = callback || function(){};

                //Reset des frames
                tickCount = 0;
                frameIndex = $this.firstFrame;

                //Au prochain update, l'animation commencera si l'animation est lancée
            }



            //Dessine le sprite.
            $this.render = function (x, y) {

                //On met à jour la position des frames
                update();

                //Position données en paramètre
                if(x){$this.x = x;}
                if(y){$this.y = y;}

                /*
                $this.context.fillStyle = "#000000";
                $this.context.fillRect($this.x, $this.y, $this.clipWidth, $this.clipHeight);
                */

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



    /**
     * préconstruit des objets sprites pour des objets du stage
     */
    app.factory('SpriteFactory', ['Sprite', function(Sprite){

        var $this = {};
        //TODO chargement des images

        var playerImage = new Image();
        playerImage.src = "../../img/game/spriteplayer.png";

        var playerImageReverse = new Image();
        playerImageReverse.src = "../../img/game/spriteplayerreverse.png";

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


        var yoloImage = new Image();
        yoloImage.src = "../../img/game/yolo.png";


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


    app.factory('HpBarSprite', ['GameConfig', function(GameConfig){
        //Barre de vie
        function HpBarSprite(options){

            this.context = options.context;
            this.stageSprite = options.stageSprite;
            this.stageX = this.stageSprite.stageX + this.stageSprite.x;
            this.stageY = this.stageSprite.stageY + this.stageSprite.y;
            this.width = this.stageSprite.width/2;
            this.type = options.type;
            this.x = (this.type == 'RIGHT') ? this.stageSprite.width/2 : 0;
            this.y = 5;

            this.pourcentWidth = 100;
            this.text = null;
            this.isUpdated = true;

            var BAR_HEIGHT = 20;

            //Modifie les stats du joueur
            this.update = function(text, width){
                if(text){
                    this.text = text;
                }

                console.log("ATTCK UPDATE", text, this.x + this.stageX);

                if(width && width >= 0 && width <= 100) {
                    this.pourcentWidth = width;
                }

                this.isUpdated = true;
            };


            this.render = function(){

                if(!this.isUpdated){
                    return false;
                }

                var fullX = this.x + this.stageX;
                var fullY = this.y + this.stageY;

                var containerWidth = ((this.width - 140) * 70)/100;
                var barWidth = (this.pourcentWidth * containerWidth) / 100;
                var containerX = ((this.width - containerWidth) / 2) + fullX;
                var containerY = fullY;

                this.context.clearRect(containerX, containerY, containerWidth, BAR_HEIGHT);

                this.context.rect(containerX, containerY, containerWidth, BAR_HEIGHT);
                this.context.strokeStyle = '#333';
                this.context.stroke();
                this.context.fillStyle = "red";
                this.context.fillRect(containerX + 1, containerY + 1, barWidth - 2, BAR_HEIGHT - 2);


                //Texte
                var fontfamilly = GameConfig.stage.fonts.familly;
                var fontsize = GameConfig.stage.fonts.size;
                var fontcolor = GameConfig.stage.fonts.color;
                var textX, textY;


                if(this.type == 'LEFT'){
                    textX = fullX + 10;
                }
                else{
                    textX = fullX + this.width - 10;
                }

                textY = fullY + 15;

                this.context.textAlign = this.type.toLowerCase();
                this.context.font = fontsize + " " + fontfamilly;
                this.context.fillStyle = fontcolor;
                this.context.fillText(this.text, textX, textY);


                this.isUpdated = false;
            };
        };

        return (HpBarSprite);
    }]);

    //Sprite stage
    app.factory('StageSprite', ['GameConfig', function(GameConfig){

        function StageSprite(options){

            this.context = options.context;
            this.width = options.width;
            this.height = options.height;
            this.x = 0;
            this.y = 0;
            this.stageX = 0;
            this.stageY = 0;
            this.timer = 0;
            /*this.hpUpdatedLEFT = false;
            this.hpUpdatedRIGHT = false;*/

            var HEADER_HEIGHT = 30;
            var FOOTER_HEIGHT = 50;
            var TIMER_WIDTH = 140;

            //Modifie la position du stage
            this.updatePosition = function(stageX, stageY){
                //console.log(this.stageX, this.stageY, stageX, stageY);
                this.stageX = stageX;
                this.stageY = stageY;
            };


            //Modifie les infos du stage
            this.updateTime = function(timer){
                this.timer = timer;
            };


            //Affiche le fond
            this.renderStage = function(){

                //On clear tout
                this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

                var fullX = this.x + this.stageX;
                var fullY = this.y + this.stageY;
                var width = this.width;
                var height = this.height;
                var fontfamilly = GameConfig.stage.fonts.familly;
                var fontsize = GameConfig.stage.fonts.size;
                var fontcolor = GameConfig.stage.fonts.color;


                //STAGE
                this.context.rect(fullX, fullY, width, height);
                this.context.strokeStyle = GameConfig.stage.border;
                this.context.stroke();


                //FOOTER
                var h = FOOTER_HEIGHT;
                var rectFooterY = fullY + height - h;
                this.context.textAlign = 'left';
                this.context.rect(fullX, rectFooterY, width, h);
                this.context.stroke();

                //CONTROLES
                this.context.font = fontsize + " " + fontfamilly;
                this.context.fillStyle = fontcolor;
                this.context.textAlign = 'left';
                var textControles = "Controles:";
                var paddingleft = fullX + 20;
                var widthText = 0;

                this.context.fillText(textControles, paddingleft, rectFooterY + 20);

                //On ajoute de l'espace à gauche
                widthText = this.context.measureText(textControles).width;
                paddingleft += widthText + 20;

                var listeControles = [
                    ["Move Left [Q]", "Move Right [D]"],
                    ["Crouch [S]", "Jump [Z]"],
                    ["Kick [E]", "Punch [A]"],
                    ["Special 1 [Z + Z + S + S]", "Special YOLO [Q + D + Q + D]"],
                ];

                for(var index in listeControles){
                    var controlTab = listeControles[index];

                    this.context.fillText(controlTab[0], paddingleft, rectFooterY + 20);
                    this.context.fillText(controlTab[1], paddingleft, rectFooterY + 40);

                    paddingleft += Math.max(this.context.measureText(controlTab[0]).width, this.context.measureText(controlTab[1]).width);
                    paddingleft += 20;
                }



                //HEADER
                this.context.rect(fullX, fullY, width, HEADER_HEIGHT);
                this.context.stroke();

                this.context.beginPath();
                this.context.moveTo(fullX + width/2 - TIMER_WIDTH/2, fullY);
                this.context.lineTo(fullX + width/2 - TIMER_WIDTH/2, fullY + HEADER_HEIGHT);
                this.context.stroke();

                this.context.beginPath();
                this.context.moveTo(fullX + width/2 + TIMER_WIDTH/2, fullY);
                this.context.lineTo(fullX + width/2 + TIMER_WIDTH/2, fullY + HEADER_HEIGHT);
                this.context.stroke();
            };





            //Affiche le stage
            this.render = function(){

                var fullX = this.x + this.stageX;
                var fullY = this.y + this.stageY;
                var width = this.width;
                var height = this.height;


                //Timer
                var minutes = Math.floor(this.timer/60);
                var secondes = Math.round(this.timer - (minutes / 60));
                minutes = (minutes < 10) ? "0" + minutes : minutes;
                secondes = (secondes < 10) ? "0" + secondes : secondes;
                var text = minutes + ":" + secondes;

                //Font
                var fontfamilly = GameConfig.stage.fonts.familly;
                var fontsize = GameConfig.stage.fonts.size;
                var fontcolor = GameConfig.stage.fonts.color;
                this.context.font = fontsize + " " + fontfamilly;
                this.context.fillStyle = fontcolor;
                this.context.textAlign = 'center';

                /*var textWidth = this.context.measureText(text).width;
                var textHeigt = 20;*/

                var timerX =  width / 2 + fullX;
                var timerY = fullY + 10;
                var timerXClear = (width - TIMER_WIDTH) / 2 + fullX;


                this.context.clearRect(timerXClear, fullY + 1, TIMER_WIDTH, HEADER_HEIGHT - 2);
                this.context.fillText(text, timerX, timerY + 10);

                //Clear l'air de jeu
                this.context.clearRect(fullX + 1, fullY + HEADER_HEIGHT + 1, this.width - 2, this.height - HEADER_HEIGHT - FOOTER_HEIGHT - 2);
                this.context.clearRect(0, fullY, fullX - 1, fullY + this.height);
                this.context.clearRect(fullX + this.width + 1, fullY, window.innerWidth, fullY + this.height);
            };



            //DEBUG
            this.afficherInfos = function(){
                console.log("X" , this.x);
                console.log("Y" , this.y);
                console.log("stageX" , this.stageX);
                console.log("stageY" , this.stageY);
                console.log("width" , this.width);
                console.log("height" , this.height);
            };



            //this.renderOnce();

        }

        return (StageSprite);
    }]);






    app.factory('Player', ['SpriteFactory', 'StateFactory', 'HpBarSprite', 'GameConfig',
        function(SpriteFactory, StateFactory, HpBarSprite, GameConfig){


            function Player(options) {

                this.isOpponent = options.isOpponent;
                this.name = options.name;
                this.context = options.context;
                this.stageSprite = options.stageSprite;
                this.orientation = options.orientation;
                this.stageX = this.stageSprite.stageX;
                this.stageY = this.stageSprite.stageY;
                this.stageW = this.stageSprite.width;
                this.stageH = this.stageSprite.height;
                this.eventServer = options.eventServer || false;
                this.eventEnd = options.eventEnd || false;
                this.whichPlayer = (options.orientation == 'RIGHT') ? 'LEFT' : 'RIGHT';

                this.sprite = SpriteFactory.getSpritePlayer(options.context, this.name, (this.orientation == 'LEFT' ));

                //Calcule position
                this.x = 0;
                this.y = 0;
                this.velocityX = 0;
                this.velocityY = 0;
                this.minY = 0;
                this.maxY = 0;

                //Calcul Y
                this.y =  this.stageSprite.height - this.sprite.clipHeight - 70;

                this.maxY = this.y;
                this.minY = this.y - 100;

                //States
                this.hp = GameConfig.fight.hp || 100;
                this.pressedKeys = [];
                this.combinedKeys = [];

                //Sprite YOLO (modifier si possible)
                this.yolosprite;

                //Joueur collision
                this.playerCollision = false;


                //Construction
                this.hpStat = new HpBarSprite({
                    context: this.context,
                    stageSprite: this.stageSprite,
                    type: this.whichPlayer,
                });


                //Set yolo
                this.setSpriteYolo = function(){

                    this.yolosprite = SpriteFactory.getSpriteYolo(this.context);
                    this.yolosprite.y = this.y - (this.yolosprite.clipHeight / 2)  + this.stageY;

                    if(this.orientation == "LEFT"){
                        console.log("LEFT YOLO");
                        this.yolosprite.velocityX = -10;
                        this.yolosprite.x = this.x + this.stageX - this.yolosprite.clipWidth;
                    }
                    else{
                        console.log("RIGHT YOLO");
                        this.yolosprite.velocityX = 10;
                        this.yolosprite.x = this.x + this.sprite.clipWidth + this.stageX ;
                    }
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


                    this.hpStat.render();

                    if(this.yolosprite !== undefined){
                        this.yolosprite.x = this.yolosprite.x + this.yolosprite.velocityX;
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

                    //Mouvement
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

                    if(this.x > this.stageW - this.sprite.clipWidth){
                        this.x = this.stageW - this.sprite.clipWidth;
                    }

                };

                //Action à effectuer à chaque attaque
                this.attack = function(){
                    if(this.playerCollision){

                        //attaquant
                        var damageBottom = this.currentState.damageBottom;
                        var damageTop = this.currentState.damageTop;

                        //Défenseur
                        var protectedBottom = this.playerCollision.currentState.protectedBottom;
                        var protectedTop = this.playerCollision.currentState.protectedTop;


                        if(damageBottom > 0 && !protectedBottom){
                            this.playerCollision.takeDamage(damageBottom);
                        }

                        if(damageTop > 0 && !protectedTop){
                            this.playerCollision.takeDamage(damageTop);
                        }

                    }
                };


                //Le joueur prend des dommages
                this.takeDamage = function(damage){
                    this.hp -= damage;

                    if(this.eventServer){
                        window.dispatchEvent(this.eventServer);
                    }

                    if(this.hp <= 0){
                        this.hp = 0;
                    }

                    this.updateHp();
                };


                //Met à jour les points de vies
                this.updateHp = function(){
                    var percent = (this.hp * 100) / GameConfig.fight.maxHp;
                    this.hpStat.update(this.name, percent);
                };


                //On définie l'orientation. Si elle est différente de l'orientation courante, on pivote le joueur
                this.setOrientation = function(orientation){
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
                };


                //Retourne le message contenant les données à envoyer au serveur
                //Reverse toutes les positon
                this.getMessage = function(){
                    var currentState = this.currentState.stateName;
                    /*if(currentState == StateFactory.STATE_LEFT){
                        currentState = StateFactory.STATE_RIGHT;
                    }
                    else if(currentState == StateFactory.STATE_RIGHT){
                        currentState = StateFactory.STATE_LEFT;
                    }
                    */

                    return {
                        currentState: currentState,
                        x: this.x,
                        y: this.y,
                        velocityX: this.velocityX,
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
                        this.x = x;
                        this.y = y;
                        this.updateHp(hp);
                    }
                    else{
                        console.error("State " + stateName + " invalid");
                    }

                };



                //INIT
                this.currentState = StateFactory.getInstance(StateFactory.STATE_IDLE);
                this.currentState.go(this);

                this.updateHp(this.hp);
            }


            return (Player);
    }]);











}());