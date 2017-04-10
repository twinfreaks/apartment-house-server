'use strict';

var Waterline = require('waterline');

var ChatMessage = {
    identity: 'chatmessage',
    connection: 'default',

    attributes: {
        messageBody: {
            type: 'text'
        },
        messageTime: {
            type: 'datetime'
        },
        messageReaded: {
            type: 'boolean'
        },
        //Connections to another models
        sender: {
            model: 'inhabitant'
        },
        recipient: {
            model: 'inhabitant'
        },
        thread: {
            model: 'chatthread'
        }

    }
};

module.exports = Waterline.Collection.extend(ChatMessage);