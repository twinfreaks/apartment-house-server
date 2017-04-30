'use strict';

var Waterline = require('waterline');
var ChatThread = {
    identity: 'userlogs',
    connection: 'default',

    attributes: {
        lastLogin: {
            type: 'datetime'
        },
        ipAddress: {
            type: "string"
        },
        browser: {
            type: "string"
        },
        operatingSystem: {
            type: "string"
        },
        // Connections with other models
        user: {
            model: 'user'
        }
    }
};


module.exports = Waterline.Collection.extend(ChatThread);