'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema = mongoose.Schema;



/**
 * User Schema
 */
var MessageSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    text: {
        type: String,
        default: ''
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

mongoose.model('User', UserSchema);
