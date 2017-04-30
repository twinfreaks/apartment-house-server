var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res, next) {
            models.wl.collections.requesttype
                .findOne({id: req.params.id})
                .then(function (request) {
                    res.json({data: request, code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        })

        .put(function (req, res, next) {
            models.wl.collections.requesttype
                .update({id: req.params.id}, req.body)
                .then(function (request) {
                    res.json({data: request, code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        })

        .delete(function (req, res, next) {
            models.wl.collections.requesttype
                .update(
                    {id: req.params.id},
                    {isDeleted: true})
                .then(function () {
                    res.json({data: "Deleted", code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        });

    router.route('/')
        .get(function (req, res) {
            console.log("request");
            models.wl.collections.requesttype
                .find(
                    {isDeleted: {'!': 'true'}},
                    {sort: {id: 1}}
                )
                .then(function (types) {
                    res.json({data: types, code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        })

        .post(function (req, res) {
            models.wl.collections.requesttype
                .create(req.body)
                .then(function (request) {
                    res.json({data: request, code: 200})
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500})
                });
        })
};