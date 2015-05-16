var User = require('../models/mongoose/user.server.model');


module.exports = {

    index: function(request, response, next){
        console.log("test");
        response.render('index');
    },


    //Test si la valeur d'une champs est unique pour une table donnée
    uniqueValue: function(req, res, next){
        var schema = eval(req.body.schema);
        var options = {};
        options[req.body.dbfield] = req.body.username;

        //On essaye de trouver un objet. Si un objet est trouvé, il n'est pas unique, on retourne false;
        schema.findOne(options, function(error, object) {
            console.log(object);
            res.send({status: (object == null)});
        });

    }



}

