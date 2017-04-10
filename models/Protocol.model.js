'use strict';

var Waterline = require('waterline');

var Protocol = {
    identity: 'protocol',
    connection: 'default',

    attributes: {
        title: {
            type: 'string'
        },
        description: {
            type: 'text'
        },
        isActive: {
            type: 'boolean'
        },
        publicatedFrom: {
            type: 'datetime'
        },
        isProtocol: {
            type: 'boolean'
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
        inhabitants: {
            collection: 'inhabitant',
            via: 'protocols'
        },

        admin: {
            model: 'admin'
        },
        event: {
            model: 'event'
        }
    }
};


module.exports = Waterline.Collection.extend(Protocol);