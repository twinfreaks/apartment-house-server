var models = require('../models'),
    moment = require('moment');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .post(function (req, res, next) {
            if (req.body.password !== req.body.passwordRepeat) {
                return res.json({data: "passwords doesn't conicinde", code: 500})
            }

            models.wl.collections.user.update(
                {
                    id: req.user.sub
                },
                {
                    "password": models.wl.collections.user.hashPassword(req.body.password)
                }
            )
                .then(function(user) {
                    return models.wl.collections.message_queue.create({
                        recipient: user[0].email,
                        type: "email",
                        sendType: "change-password",
                        plannedAt: moment().format(),
                        state: 'NEW',
                        lang: req.body.lang,
                        data: {
                            user: user[0].email
                        }
                    });
                })
                .then(function () {
                    res.json({
                        data: "change password",
                        code: 200
                    });
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        });
};