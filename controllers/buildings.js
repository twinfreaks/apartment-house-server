var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res, next) {
            models.wl.collections.building.findOne({
                id: req.params.id
            }).then(function (building) {
                res.json(
                    {
                        data: building,
                        code: 200
                    }
                );
            }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        });

    router.route('/')
        .get(function (req, res, next) {
            models.wl.collections.building.find()
                .sort('streetName ASC')
                .sort('buildingNumber ASC')
                .then(function (buildings) {
                    res.json({data: buildings, code: 200});
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        })

        .post(function (req, res, next) {
            models.wl.collections.building
                .create({
                    streetName: req.body.streetName,
                    buildingNumber: req.body.buildingNumber
                })
                .then(function (building) {
                    res.json({
                        data: building, code: 200
                    });
                })
                .catch(function (err) {
                    res.json({
                        data: err.toString(), code: 500
                    });
                });
        });

    router.route('/:id/inhabitants')
        .get(function (req, res, next) {
            models.wl.collections.building.findOne({
                id: req.params.id
            }).populate('inhabitants', {sort: 'surname ASC'})
                .then(function (inhabitants) {
                    res.json(
                        {
                            data: inhabitants,
                            code: 200
                        }
                    );
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        });
};