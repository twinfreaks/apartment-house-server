var models = require('../models'),
    _ = require('lodash');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .get(function (req, res, next) {
            if (typeof req.query.blog !== 'undefined') {
                models.wl.collections.gallery
                    .find({isDeleted: {'!': 'true'}})
                    .where({'blog': req.query.blog})
                    .sort('id ASC')
                    .then(function (gallery) {
                        res.json({data: gallery, code: 200});
                    }).catch(function (err) {
                        res.json({data: err.toString(), code: 500});
                    });
            }
        })

        .post(function (req, res, next) {
            models.wl.collections.gallery
                .create(req.body)
                .then(function (gallery) {
                    res.json({data: gallery, code: 200});
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        })

        .delete(function (req, res, next) {
            if (typeof req.query.id !== 'undefined') {
                models.wl.collections.gallery
                    .update(
                        {id: req.query.id},
                        {isDeleted: true}
                    )
                    .then(function () {
                        res.json({data: "Deleted", code: 200});
                    }).catch(function (err) {
                        res.json({data: err.toString(), code: 500});
                    })
            }
        })
};