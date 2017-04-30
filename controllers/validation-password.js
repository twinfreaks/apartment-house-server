var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .post(function (req, res, next) {
            models.wl.collections.user.findOne({
                id: req.user.sub
            })
                .then(function (user) {
                    res.json({
                        data: user.password === models.wl.collections.user.hashPassword(req.body.password),
                        code: 200
                    });
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        });
};