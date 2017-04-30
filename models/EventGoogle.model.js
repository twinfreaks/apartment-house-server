'use strict';

var Waterline = require('waterline');

var Event = {
  identity: 'eventgoogle',
  connection: 'default',

  attributes: {
    googleId: {
      type: 'string',
      unique: true
    },
    event: {
      model: 'event'
    },
    inhabitant: {
      model: 'inhabitant'
    }
  }
};


module.exports = Waterline.Collection.extend(Event);
