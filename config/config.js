(function(){


    var passportConf = require('./passport');


    //Export
    module.exports = {
        db: {
            port: '27017',
            database: 'swagfighterDb',
            uri: 'mongodb://localhost',
            options: {
                user: '',
                pass: ''
            }
        },
        passport: passportConf, //On inclut la conf de passport
        cookies: {
            secret: "Lescookiescafoutlesummaistktmorraycestjustepourlesflashmessagetrucdefragile"
        }
    };

}());