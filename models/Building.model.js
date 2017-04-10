'use strict';

var Waterline = require('waterline');

var Building = {
    identity: 'building',
    connection: 'default',

    attributes: {
        streetName: {
            type: 'string'
        },
        buildingNumber: {
            type: 'string'
        },

        inhabitants: {
            collection: 'inhabitant',
            via: 'building'
        }
    }
};


module.exports = Waterline.Collection.extend(Building);