/**
 * Objet User
 */

'use strict';


/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jwt-simple');
var tokenApp = require('../../config/tokens');
var Schema = mongoose.Schema;




/**
 * User Schema
 */
var UserSchema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: "Le nom d'utilisateur existe déjà",
        required: 'Please fill in a username'
    },
    password: String,
    token: String,
    trophies: {
        type: Number,
        min: 0,
        default: 0
    },
    timePlayed: {
        type: Number,
        min: 0,
        default: 0
    },
    victories: {
        type: Number,
        min: 0,
        default: 0
    },
    defeats: {
        type: Number,
        min: 0,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

//Generate new Token
UserSchema.methods.generateToken = function() {
    //Date d'expiration
    var dateObj = new Date();
    var numDays = tokenApp.expireNbDay || 3; //(par defaut: 3 jours)
    var expires = dateObj.setDate(dateObj.getDate() + numDays);

    //Token
    var tok = jwt.encode({
        exp: expires
    }, tokenApp.secret);

    this.token = tok;
};

//test si un token correspond au token de l'user et si celui ci n'est pas expiré
UserSchema.methods.verifyToken = function(t) {
    //Si les tokens sont différent, on retourne false
    if(t !== this.token){
        return false;
    }

    //Sinon on test la validité du token
    return this.isTokenValid();
};



//Déchiffre le token
UserSchema.methods.getDecryptedToken = function() {

    var tok = this.token || null;

    //Si token vide
    if(tok == ""){
        return null;
    }

    //Sinon on retourne le token dechiffré
    return jwt.decode(tok, tokenApp.secret);
};


//Test si le token est encore valide
UserSchema.methods.isTokenValid = function() {

    var decoded = this.getDecryptedToken() || null;

    //Si token decrypté est vide, il n'est plus valide
    if(decoded.length == 0){
        this.token = null;
        return false;
    }

    //Sinon on compare avec la date du jour (valide si date expiration supérieur à date du jour)
    if(decoded.exp > Date.now()){
        return true;
    }
    else{
        this.token = null;
        return false;
    }
};





// generating a hash
UserSchema.methods.generateHash = function(pwd) {
    return bcrypt.hashSync(pwd, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(pwd) {
    return bcrypt.compareSync(pwd, this.password);
};


module.exports = mongoose.model('User', UserSchema);
