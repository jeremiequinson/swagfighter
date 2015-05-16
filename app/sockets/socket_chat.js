(function(){
    "use strict";

    var SocketMessages = require('../models/socketMessages.server.model');

    //Evenements socket pour le chat
    module.exports = function(client){

        //Initialisation Liste des utilisateurs connectés
        client.on('lobby.chat.init', function(){
            SocketMessages.getRecentMessages(function(err, list){
                if(err){
                    console.log(err);
                }
                else{
                    client.emit('lobby.chat.init', {messages: list});
                }

            });
        });



        //lorsqu'on renvoie un message
        client.on('chat.sendmessage', function(data){
            client.broadcast.emit("chat.messagesent", {
                message: data,
                username: client.userSocket.getUsername()
            });

            SocketMessages.saveMessage(data, client.userSocket);
        });


    };


}());