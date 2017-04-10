'use strict';

var Waterline = require('waterline');

var ChatMessage = {
    identity: 'chatthread',
    connection: 'default',

    attributes: {
        name: {
            type: 'text'
        },
        lastMessage: {
            type: 'json'
        },
        //Connections to another models
        user: {
            model: 'inhabitant'
        },
        messages: {
            collection: 'chatmessage',
            via: 'thread'
        }

    }
};

module.exports = Waterline.Collection.extend(ChatMessage);