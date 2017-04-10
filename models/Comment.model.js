'use strict';
var Waterline = require('waterline');
var Comment = {
    identity: 'comment',
    connection: 'default',
    attributes: {
        id: {
            type: 'integer',
            autoIncrement: true,
            primaryKey: true
        },
        text: {
            type: 'text'
        },

        comments: {
            collection: 'comment',
            via: 'id'
        },
        blog: {
            model: 'blog'
        },
        admin: {
            model: 'admin'
        },
        inhabitant: {
            model: 'inhabitant'
        },
        isDeleted: {
            type: 'boolean'
        },
        editedAt: {
            type: 'datetime'
        }
    }
};
module.exports = Waterline.Collection.extend(Comment);
