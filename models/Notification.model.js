'use strict';

var Waterline = require('waterline');

var Notification = {
    identity: 'notification',
    connection: 'default',

    attributes: {
        title: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        from: {
            type: 'datetime'
        },

        users: {
            collection: 'user',
            via: 'notifications'
        }
    }
};


module.exports = Waterline.Collection.extend(Notification);