var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res, next) {
            models.wl.collections.request
                .findOne({id: req.params.id})
                .then(function (request) {
                    res.json({data: request, code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        })

        .put(function (req, res, next) {
            models.wl.collections.request
                .update({id: req.params.id}, req.body)
                .then(function (request) {
                    res.json({data: request, code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        })

        .delete(function (req, res, next) {
            models.wl.collections.request
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
            if (typeof req.query.countNotDone !== 'undefined') {
                models.wl.collections.request
                    .count({
                        isDeleted: {'!': 'true'},
                        isDone: 'false'
                    })
                    .then(function (count) {
                        res.json({data: count, code: 200});
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500});
                    })
            } else {
                var query = 'SELECT request.text, request."isDone", request.id, request.inhabitant, ' +
                    'request."requestType", request."createdAt", inhabitant.name, inhabitant.surname, ' +
                    'inhabitant."phoneNumber", inhabitant.email, inhabitant.appartment, building."buildingNumber", ' +
                    'building."streetName" FROM request INNER JOIN inhabitant ON request.inhabitant = inhabitant.id ' +
                    'INNER JOIN building ON inhabitant.building = building.id WHERE request."isDeleted"=false ORDER BY request."createdAt" DESC';
                models.wl.collections.request.query(query, [],
                    function (err, rawResult) {
                        if (err) {
                            return res.serverError(err);
                        }
                        return res.json({data: rawResult.rows, code: 200});
                    }
                )
            }
        })

        .post(function (req, res) {
            models.wl.collections.request
                .create(req.body)
                .then(function (request) {
                    res.json({data: request, code: 200})
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500})
                });
        })

        .delete(function (req, res, next) {
            if (typeof req.query.requestType !== 'undefined' && req.query.requestType >= 0) {
                models.wl.collections.request
                    .update(
                        {requestType: req.query.requestType},
                        {isDeleted: true})
                    .then(function () {
                        res.json({data: "Deleted", code: 200});
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500});
                    });
            }
        })
};