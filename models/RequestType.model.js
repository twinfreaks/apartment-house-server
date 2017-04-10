'use strict';

var Waterline = require('waterline');

var RequestType = {
    identity: 'requesttype',
    connection: 'default',

    attributes: {
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        requests: {
            collection: 'request',
            via: 'requestType'
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: 'false'
        }
    }
};

module.exports = Waterline.Collection.extend(RequestType);