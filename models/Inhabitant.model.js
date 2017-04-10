'use strict';

var Waterline = require('waterline');
var ChatThread = {
    identity: 'inhabitant',
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
        appartment: {
            type: 'integer'
        },
        photo: {
            type: 'string'
        },
        phoneNumber: {
            type: 'string',
            unique: true
        },
        email: {
            type: 'string',
            unique: true
        },
        isActive: {
            type: 'boolean',
            defaultsTo: false
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        // Connections with other models
        user: {
            model: 'user',
            unique: true
        },
        building: {
            model: 'building'
        },
        comments: {
            collection: 'comment',
            via: 'inhabitant'
        },
        calculation: {
            collection: 'calculation',
            via: 'inhabitants'
        },
        calculations: {
            collection: 'calculation',
            via: 'inhabitant'
        },
        blogs: {
            collection: 'blog',
            via: 'inhabitants'
        },
        events: {
            collection: 'event',
            via: 'inhabitants'
        },
        protocols: {
            collection: 'protocol',
            via: 'inhabitants'
        },
        sendedMessages: {
            collection: 'chatmessage',
            via: 'sender'
        },
        recievedMessages: {
            collection: 'chatmessage',
            via: 'recipient'
        },
        threads: {
            collection: 'chatthread',
            via: 'user'
        }
    }
};


module.exports = Waterline.Collection.extend(ChatThread);