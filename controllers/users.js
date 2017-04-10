var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res, next) {
            models.wl.collections.user.findOne({
                id: req.params.id
            })
                .then(function (user) {
                    res.json(
                        {
                            data: user,
                            code: 200
                        }
                    );
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        })
        .delete(function (req, res, next) {
            models.wl.collections.user.destroy({
                id: req.params.id
            }).then(function () {
                res.json({data: "Deleted", code: 200});
            }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            })
        });

    router.route('/')
        .get(function (req, res, next) {
            models.wl.collections.user.find()
                .then(function (users) {
                    res.json({data: users, code: 200});
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        })

        .post(function (req, res, next) {
            models.wl.collections.user.create({
                username: req.body.username,
                password: models.wl.collections.user.hashPassword(req.body.password)
            })
                .then(function (user) {
                    res.json({data: user, code: 200});
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        });
};