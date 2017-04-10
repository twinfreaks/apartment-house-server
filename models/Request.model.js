'use strict';

var Waterline = require('waterline');

var Request = {
    identity: 'request',
    connection: 'default',

    attributes: {
        text: {
            type: 'text'
        },
        isDone: {
            type: 'boolean',
            defaultsTo: 'false'
        },

        inhabitant: {
            model: 'inhabitant'
        },
        requestType: {
            model: 'requesttype'
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: 'false'
        }
    }
};

module.exports = Waterline.Collection.extend(Request);