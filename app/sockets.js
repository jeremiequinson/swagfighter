(function(){

    module.exports = function(app) {

        "use strict";

        //Socket
        var server = require('http').createServer(app);
        var io = require('socket.io')(server);
        var clientsConnected = {};





        io.use(function (socket, next) {
            console.log(socket);
            next();
        });

        //Lorsque le client se connecte, on  envoie une demande d'authentification
        io.on('connection', function (client) {

            //Lorsque le client nous renvoie ses identifiants, on récupère l'objet user correspondant
            //Ensuite, on l'ajoute dans la liste des utilisateurs connecté
            client.on('auth', function (data) {

            });


            console.log('Client connecté');

            client.on('test', function (message) {
                console.log('========================');
                console.log('Message : ');
                console.log(message);
            });

            //Lorsque le client se deconnecte
            client.on('disconnect', function () {
                console.log("Un fragile qui se casse.");
                //clientsConnected.remove(client);
            });

        });


        return server;
    }


}());