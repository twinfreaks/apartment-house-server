'use strict';

var Waterline = require('waterline');

var UserConfig = {
    identity: 'userconfig',
    connection: 'default',

    attributes: {
        userID: {
            type: 'integer'
        },
        viewBlogs: {
            type: 'boolean'
        },
        viewEvents: {
            type: 'boolean'
        },
        viewCalculations: {
            type: 'boolean'
        },
        viewProtocols: {
            type: 'boolean'
        },
        blogsCount: {
            type: 'integer'
        },
        eventsCount: {
            type: 'integer'
        },
        calculationsCount: {
            type: 'integer'
        },
        protocolsCount: {
            type: 'integer'
        },
        viewOrder: {
            type: 'string'
        },
        theme: {
            type: 'string'
        }
    }
};

module.exports = Waterline.Collection.extend(UserConfig);