var models = require('../models'),
    Promise = require("bluebird"),
    _ = require('lodash');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res, next) {
            models.wl.collections.calculation.findOne({
                id: req.params.id
            })
                .then(function (calculation) {
                    res.json(
                        {
                            data: calculation,
                            code: 200
                        }
                    );
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        })
        .put(function (req, res, next) {
            models.wl.collections.calculation
                .update({
                        id: req.params.id
                    },
                    {
                        toPayAmount: req.body.toPayAmount,
                        payedAmount: req.body.payedAmount,
                        debt: req.body.debt,
                        date: req.body.date
                    }
                )
                .then(function (calculation) {
                    res.json({
                        data: calculation, code: 200
                    });
                })
                .catch(function (err) {
                    res.json({
                        data: err.toString(), code: 500
                    });
                });
        })
        .delete(function (req, res, next) {
        });

    router.route('/')
        .get(function (req, res, next) {
            if(typeof req.query.inhabitant !== 'undefined' && typeof req.query.page !== 'undefined' && req.query.page > 0 && typeof req.query.type !== 'undefined'){
                var pageNumber = req.query.page,
                    calculationsPerPage = 12,
                    pageCount = null,
                    findCalculations;
                findCalculations = (req.query.type == 0)?{inhabitant: req.query.inhabitant}:{inhabitant: req.query.inhabitant, calculationType: req.query.type};
                models.wl.collections.calculation.count(findCalculations)
                    .then(function (calculations) {
                        pageCount = Math.ceil(calculations / calculationsPerPage);
                        return pageCount;
                    })
                    .then(function(){
                        return models.wl.collections.calculation.find(findCalculations)
                            .sort('updatedAt DESC')
                            .paginate({
                                page: pageNumber, limit: calculationsPerPage
                            })
                            .populate('calculationType');
                    })
                    .then(function(calculations){
                        res.json({
                            data: {
                                totalPage: pageCount,
                                lenght: calculations.length,
                                calculations: calculations
                            },
                            code: 200
                        })
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500});
                    });
            } else {
                res.json({data: 'must provide with inhabitant id, page for pagination and calculation type id', code: 200});
            }
        })

        .post(function (req, res, next) {
            if (req.query.array) {
                var calculations = req.body,
                    updated = [],
                    posted = [];
                _.forEach(calculations, function (calculation) {
                    if (calculation.saved) {
                        updated.push(calculation);
                    } else {
                        posted.push(calculation);
                    }
                });
                Promise.each(updated, function (calculation) {
                    return models.wl.collections.calculation
                        .update({
                                id: calculation.id
                            },
                            {
                                toPayAmount: calculation.toPayAmount,
                                payedAmount: calculation.payedAmount,
                                debt: calculation.debt,
                                date: calculation.date
                            }
                        )
                })
                    .then(function (data) {
                        var dataToReturn = [];
                        data.forEach(function (calculation) {
                            dataToReturn.push(calculation);
                        });
                        models.wl.collections.calculation
                            .create(posted)
                            .then(function (data) {
                                data.forEach(function (calculation) {
                                    dataToReturn.push(calculation);
                                });
                                res.json({
                                    data: dataToReturn, code: 200
                                });
                            })
                            .catch(function (err) {
                                res.json({
                                    data: err.toString(), code: 500
                                });
                            });
                    })
                    .catch(function (err) {
                        res.json({
                            data: err.toString(), code: 500
                        });
                    });
            } else {
                models.wl.collections.calculation
                    .create({
                        toPayAmount: req.body.toPayAmount,
                        payedAmount: req.body.payedAmount,
                        debt: req.body.debt,
                        date: req.body.date,
                        calculationType: req.body.calculationType,
                        inhabitant: req.body.inhabitant
                    })
                    .then(function (calculation) {
                        res.json({
                            data: calculation, code: 200
                        });
                    })
                    .catch(function (err) {
                        res.json({
                            data: err.toString(), code: 500
                        });
                    });
            }
        });
};