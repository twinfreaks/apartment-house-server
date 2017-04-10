'use strict';
var Waterline = require('waterline');

var CalculationType = {
    identity: 'calculationtype',
    connection: 'default',

    attributes: {
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        icon: {
            type: 'string'
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: 'false'
        },
        calculations: {
            collection: 'calculation',
            via: 'calculationType'
        }
    }
};

module.exports = Waterline.Collection.extend(CalculationType);