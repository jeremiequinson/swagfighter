/**
 * Created by Jérémie Quinson on 14/05/15.
 */
(function () {
    'use strict';

    var Message = require('./mongoose/message.server.model.js');

    //Dernier messages. Initialisé à null pour définir si on cherche les messages dans la base de données
    var recentMessages = null;
    var moduleExport = {};


    /**
     * Private scope
     */

    //Ajoute un nouveau message dans la liste des messages récents
    var addRecentMessage = function(text, username, d){


        if(recentMessages === null){
            return;
        }

        var date = d || new Date();
        var message = {
            text: text,
            username: username,
            date: date
        };

        //On ajoute dans la liste
        recentMessages.push(message);

        if(recentMessages.length > 25){
            recentMessages.shift();
        }
        //On limite le nombre de message à 25
        //recentMessages.slice(Math.max(recentMessages.length - 25, 1))
    };



    //Récupère les derniers messages
    var loadLastMessages = function(callback){

        Message.find({}).populate('user').sort('-created').exec(function(err, elements) {
            if(err) {
                return callback(err);
            }

            //Initialisa la liste
            recentMessages = [];

            elements.forEach(function(result){
                addRecentMessage(result.text, result.user.username, result.created);
            });

            return callback(null);
        });

    };








    /**
     * Public scope
     */

    //Ajoute le message dans la liste
    //Enregistre le message dans la DB
    moduleExport.saveMessage = function(text, userSocket){

        //Save message
        var newMessage = new Message();
        newMessage.user = userSocket.getUser();
        newMessage.text = text;
        newMessage.save(function(err){
            if(err){
                console.log(err);
            }
        });

        //Ajoute à la liste
        addRecentMessage(text, userSocket.getUsername());
    };



    //Récupère la liste des derniers messages
    moduleExport.getRecentMessages = function(callback){
        if(recentMessages === null){
            loadLastMessages(function(err){
                if(err){
                    return callback(err, null);
                }

                return callback(null, recentMessages);
            });
        }
        else{
            return callback(null, recentMessages);
        }
    };









    module.exports = moduleExport;

}());