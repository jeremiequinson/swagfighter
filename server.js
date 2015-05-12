(function(){

    "use strict"

    //Set up
    var express  = require('express');
    var app = express();
    var mongoose = require('mongoose');
    var port = process.env.PORT || 8080;
    var config = require('./config/config');
    var morgan = require('morgan');
    var bodyParser = require('body-parser');
    var methodOverride = require('method-override');
    var consolidate = require('consolidate');
    var path = require("path");



    //Connexion à mongodb
    var fullUrl = config.db.uri + ":" + config.db.port + "/" + config.db.database;
    console.log("Connect to : " + fullUrl);
    mongoose.connect(fullUrl, config.db.options);


    //Configuration
    app.use(express.static(path.join(__dirname + '/public')));
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({'extended':'true'}));
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(methodOverride());

    //Template engine
    app.set('view engine', 'view.html');
    app.set('views',  __dirname + '/public');
    app.engine('view.html', consolidate.ejs);

    //Sockets
    var server = require('./app/sockets')(app);

    //routes
    require('./app/routes')(app);


    server.listen(port);
    console.log("Application en attente de SWAG sur le port : " + port);

}());