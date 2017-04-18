var models = require('../models'),
    Promise = require("bluebird"),
    _ = require('lodash');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res, next) {
            models.wl.collections.calculationtype.findOne({
                id: req.params.id
            })
                .then(function (calculationType) {
                    res.json(
                        {
                            data: calculationType,
                            code: 200
                        }
                    );
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        })
        .put(function (req, res, next) {
             models.wl.collections.calculationtype.update({
                    id: req.params.id
                },
                {
                    name: req.body.name,
                    description: req.body.description,
                    icon: req.body.icon
                })
                .then(function (calculationType) {
                    res.json(
                        {
                            data: calculationType,
                            code: 200
                        }
                    );
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        })
        .delete(function (req, res, next) {
            models.wl.collections.calculationtype
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
        .get(function (req, res, next) {
            var findType;
            (typeof req.query.forAdmin !== 'undefined')?findType = {isDeleted: {'!': 'true'}}:findType = {};
            models.wl.collections.calculationtype.find(findType)
                .then(function (calculationType) {
                    res.json({data: calculationType, code: 200});
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        })

        .post(function (req, res, next) {
            models.wl.collections.calculationtype
                .create({
                    name: req.body.name,
                    description: req.body.description,
                    icon: req.body.icon
                })
                .then(function (calculationType) {
                    res.json({
                        data: calculationType, code: 200
                    });
                })
                .catch(function (err) {
                    res.json({
                        data: err.toString(), code: 500
                    });
                });
        });

    router.route('/:id/inhabitants-debts')
        .get(function (req, res, next) {
            if (typeof req.query.building !== 'undefined') {
                var result;
                models.wl.collections.building.findOne({
                    id: req.query.building
                })
                    .populate('inhabitants', {sort: 'surname ASC'})
                    .then(function (building) {
                        result = building;
                        return building
                    })
                    .then(function (building) {
                        Promise.each(building.inhabitants, function (inhabitant) {
                            return models.wl.collections.calculation
                                .find({
                                    inhabitant: inhabitant.id,
                                    calculationType: req.params.id,
                                    sort: 'updatedAt DESC',
                                    limit: 1
                                })
                                .then(function (calculation) {
                                    if (calculation.length == 1) {
                                        calculation = calculation[0];
                                    } else {
                                        return;
                                    }
                                    _.forEach(result.inhabitants, function (inhabitant) {
                                        if (calculation.inhabitant == inhabitant.id) {
                                            inhabitant.lastCalculation = calculation;
                                        }
                                    });
                                })
                        })
                            .then(function (data) {
                                res.json(
                                    {
                                        data: result,
                                        code: 200
                                    }
                                );
                            })
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500});
                    });
            } else {
                res.json(
                    {
                        data: 'must provide building id',
                        code: 200
                    }
                );
            }
        });
};