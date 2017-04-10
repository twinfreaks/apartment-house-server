'use strict';

var Waterline = require('waterline');

var Admin = {
    identity: 'admin',
    connection: 'default',

    attributes: {
        surname: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        patronymic: {
            type: 'string'
        },

        user: {
            model: 'user',
            unique: true
        },
        blogs: {
            collection: 'blog',
            via: 'admin'
        },
        comments: {
            collection: 'comment',
            via: 'admin'
        }
    }
};


module.exports = Waterline.Collection.extend(Admin);