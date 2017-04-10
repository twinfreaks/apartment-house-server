'use strict';

var Waterline = require('waterline');

var Event = {
    identity: 'event',
    connection: 'default',

   attributes: {
        title: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        start: {
            type: 'datetime'
        },
        end: {
            type: 'datetime'
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: 'false'
        },
        blogs: {
            collection: 'blog',
            via: 'event'
        },
        inhabitants: {
            collection: 'inhabitant',
            via: 'events'
        }
    }
};


module.exports = Waterline.Collection.extend(Event);