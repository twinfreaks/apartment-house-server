var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res) {
            models.wl.collections.protocol
                .findOne({
                    id: req.params.id
                })
                .then(function (protocol) {
                    res.json({data: protocol, code: 200})
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        })

        .delete(function (req, res, next) {
            models.wl.collections.protocol
                .update({
                        id: req.params.id
                    },
                    {
                        isDeleted: true
                    })
                .then(function () {
                    res.json({data: "Deleted", code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                })
        })

        .put(function (req, res, next) {
            if (req.query.type === 'isActive') {
                models.wl.collections.protocol
                    .update({
                            id: req.params.id
                        },
                        {
                            isActive: req.body.isActive
                        })
                    .then(function (protocol) {
                        res.json({data: protocol, code: 200});
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500});
                    });
            }
            if (req.query.type === 'update') {
                models.wl.collections.protocol
                    .update({
                            id: req.params.id
                        },
                        {
                            title: req.body.title,
                            description: req.body.description,
                            isActive: req.body.isActive,
                            fileUrl: req.body.fileUrl,
                            updatedAt: req.body.updatedAt
                        })
                    .then(function (protocol) {
                        res.json({data: protocol, code: 200});
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500});
                    });
            }
        });

    router.route('/')
        .get(function (req, res) {
            models.wl.collections.protocol
                .find({
                    isDeleted: false
                })
                .then(function (protocols) {
                    res.json({data: protocols, code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        })

        .post(function (req, res) {
            models.wl.collections.protocol
                .create({
                    title: req.body.title,
                    description: req.body.description,
                    fileUrl: req.body.fileUrl,
                    isActive: req.body.isActive
                })
                .then(function (protocol) {
                    res.json({data: protocol, code: 200})
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500})
                });
        })
};