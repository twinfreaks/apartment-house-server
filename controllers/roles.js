var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res, next) {
        })
        .put(function (req, res, next) {
        })
        .delete(function (req, res, next) {
        });

    router.route('/')
        .get(function (req, res, next) {
            models.wl.collections.role.find({
                name: {
                    '!': ['inhabitant', 'superAdmin']
                }
            }).then(function (roles) {
                res.json({data: roles, code: 200});
            }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        })
        .post(function (req, res, next) {
        });
};