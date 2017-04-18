var models = require('../models'),
    moment = require('moment'),
    _ = require('lodash');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .get(function (req, res) {
            if (typeof req.query.subject !== 'undefined' &&
                typeof req.query.dateFrom !== 'undefined' &&
                typeof req.query.dateTo !== 'undefined' &&
                req.query.subject === "requestsByType") {
                var dateFrom = req.query.dateFrom,
                    dateTo = req.query.dateTo,
                    allRequests = [],
                    requestsCountByType = [],
                    requestTypesTop = [];
                models.wl.collections.request
                    .find({
                        isDeleted: {'!': 'true'},
                        createdAt: {'>=': dateFrom, '<': dateTo}
                    })
                    .then(function (requests) {
                        allRequests = requests;
                        return models.wl.collections.requesttype
                            .find({
                                isDeleted: {'!': 'true'}
                            })
                    })
                    .then(function (requestTypes) {
                        var countedByType = _.countBy(allRequests, function (elem) {
                            return elem.requestType;
                        });
                        _.forEach(countedByType, function (value, key) {
                            requestsCountByType.push(value);
                            var type = _.find(requestTypes, ['id', Number(key)]);
                            requestTypesTop.push(type.name);
                        });
                        return;
                    })
                    .then(function () {
                        res.json({
                            data: {requestTypes: requestTypesTop, requestsCountByType: requestsCountByType},
                            code: 200
                        });
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500})
                    });
            }
        });
};