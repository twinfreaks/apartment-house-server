'use strict';

var Waterline = require('waterline');
var crypto = require('crypto');
var Config = require('config');


var User = {
    identity: 'user',
    connection: 'default',

    attributes: {
        username: {
            type: 'string',
            unique: true
        },
        password: {
            type: 'string',
            minLength: 4,
            maxLength: 300
        },
        passwordRestoreToken: {
            type: 'string'
        },
        passwordRestoreTokenDate: {
            type: 'datetime'
        },
        email: {
            type: 'string',
            required: true,
            unique: true
        },
        isOauth: {
            type: 'boolean',
            required: true,
            defaultsTo: false
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        //Relations to another models
        roles: {
            collection: 'role',
            via: 'users'
        },
        notifications: {
            collection: 'notification',
            via: 'users'
        },

        inhabitants: {
            collection: 'inhabitant',
            via: 'user'
        },
        admins: {
            collection: 'admin',
            via: 'user'
        }
    },

    beforeCreate: function (attrs, next) {
        attrs.password = this.hashPassword(attrs.password);
        next();
    },

    hashPassword: function (password) {
        if (typeof password !== 'undefined') {
            var hashedPassword = crypto.createHmac(Config.get('auth.algorithmHash'), Config.get("auth.passwordHash")).update(password).digest('hex');
            return hashedPassword;
        }
        else {
            return null;
        }
    }
};

module.exports = Waterline.Collection.extend(User);