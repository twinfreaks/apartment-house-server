'use strict';

var Waterline = require('waterline');
var MessageQueue = {
    identity: 'message_queue',
    connection: 'default',

    attributes: {
        recipient: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        sendType: {
            type: 'string'
        },
        data: {
            type: 'json'
        },
        plannedAt: {
            type: 'datetime'
        },
        sentAt: {
            type: 'datetime'
        },
        state: {
            type: 'string'
        },
        lang: {
            type: 'string'
        },
        attempts: {
            type: "integer"
        },
        info: {
            type: 'json'
        }
    }
};

module.exports = Waterline.Collection.extend(MessageQueue);