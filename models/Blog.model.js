'use strict';

var Waterline = require('waterline');

var Blog = {
    identity: 'blog',
    connection: 'default',

    attributes: {
        title: {
            type: 'string'
        },
        description: {
            type: 'text'
        },
        text: {
            type: 'text'
        },
        photo: {
            type: 'string'
        },
        isActive: {
            type: 'boolean'
        },
        publicatedFrom: {
            type: 'datetime'
        },
        isProtocol: {
            type: 'boolean',
            defaultsTo: 'false'
        },
        fileUrl: {
            type: 'string'
        },
        updatedDate: {
            type: 'datetime'
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: 'false'
        },

        admin: {
            model: 'admin'
        },
        event: {
            model: 'event'
        },
        comments: {
            collection: 'comment',
            via: 'blog'
        },
        galleries: {
            collection: 'gallery',
            via: 'blog'
        },
        inhabitants: {
            collection: 'inhabitant',
            via: 'blogs'
        }
    }
};

module.exports = Waterline.Collection.extend(Blog);