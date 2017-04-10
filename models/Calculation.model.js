'use strict';

var Waterline = require('waterline');

var Calculation = {
    identity: 'calculation',
    connection: 'default',

   attributes: {
        date: {
            type: 'date'
        },
        toPayAmount: {
            type: 'float'
        },
        payedAmount: {
            type: 'float'
        },
        debt: {
            type: 'float'
        },
        calculationType: {
            model: 'calculationtype'
        },
        inhabitants: {
            collection: 'inhabitant',
            via: 'calculation'
        },
        inhabitant: {
            model: 'inhabitant'
        }
    }
};


module.exports = Waterline.Collection.extend(Calculation);