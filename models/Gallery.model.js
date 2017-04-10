'use strict';

var Waterline = require('waterline');

var Gallery = {
    identity: 'gallery',
    connection: 'default',

    attributes: {
        photoUrl: {
            type: 'string'
        },
        blog: {
            model: 'blog'
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: 'false'
        }
    }
};

module.exports = Waterline.Collection.extend(Gallery);