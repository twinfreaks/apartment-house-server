var models = require('../models'),
    moment = require('moment'),
    _ = require('lodash');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .get(function (req, res) {
            if (typeof req.query.type !== 'undefined' &&
                typeof req.query.dateFrom !== 'undefined' &&
                typeof req.query.dateTo !== 'undefined') {
                var dateFrom = req.query.dateFrom,
                    dateTo = req.query.dateTo;
                switch (req.query.type) {
                    case "byRequestTypes":
                        statisticsByRequestTypes(req, res);
                        break;
                    case "byRequests":
                        statisticsByRequests(req, res);
                        break;
                }
            }
            function statisticsByRequestTypes(req, res) {
                var allRequests = [],
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
                            data: {
                                requestTypes: requestTypesTop,
                                requestsCountByType: requestsCountByType
                            },
                            code: 200
                        });
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500})
                    });
            }
            function statisticsByRequests(req, res) {
                var diff = moment(dateTo).diff(dateFrom, 'months', true),
                    notDoneRequests = [],
                    doneRequests = [],
                    notDoneRequestsCount = [],
                    doneRequestsCount = [],
                    labels = [];
                models.wl.collections.request
                    .find({
                        isDeleted: {'!': 'true'},
                        isDone: {'!': 'true'},
                        createdAt: {'>=': dateFrom, '<': dateTo},
                        sort: 'createdAt ASC'
                    })
                    .then(function (notDoneReq) {
                        notDoneRequests = notDoneReq;
                        return models.wl.collections.request
                            .find({
                                isDeleted: {'!': 'true'},
                                isDone: {'!': 'false'},
                                createdAt: {'>=': dateFrom, '<': dateTo},
                                sort: 'updatedAt ASC'
                            });
                    })
                    .then(function (doneReq) {
                        doneRequests = doneReq;
                        switch (true) {
                            case diff > 12:
                                for (var year = moment(dateFrom).startOf('year');
                                     year.isBefore(moment(dateTo));
                                     year.add(1, 'years')) {
                                    labels.push(moment(year).format('YYYY'));
                                    var notDoneCount = 0,
                                        doneCount = 0,
                                        period = year;
                                    period = moment(period).endOf('year');
                                    _.forEach(notDoneRequests, function(request) {
                                        if (moment(request.createdAt).isBetween(year, period, null, '[)')) {
                                            notDoneCount++;
                                        }
                                    });
                                    _.forEach(doneRequests, function(request) {
                                        if (moment(request.updatedAt).isBetween(year, period, null, '[)')) {
                                            doneCount++;
                                        }
                                    });
                                    notDoneRequestsCount.push(notDoneCount);
                                    doneRequestsCount.push(doneCount);
                                }
                                break;
                            case diff > 1:
                                for (var month = moment(dateFrom).startOf('month');
                                     month.isBefore(moment(dateTo));
                                     month.add(1, 'months')) {
                                    labels.push(moment(month).format('MM.YY'));
                                    var notDoneCount = 0,
                                        doneCount = 0,
                                        period = month;
                                    period = moment(period).endOf('month');
                                    _.forEach(notDoneRequests, function(request) {
                                        if (moment(request.createdAt).isBetween(month, period, null, '[)')) {
                                            notDoneCount++;
                                        }
                                    });
                                    _.forEach(doneRequests, function(request) {
                                        if (moment(request.updatedAt).isBetween(month, period, null, '[)')) {
                                            doneCount++;
                                        }
                                    });
                                    notDoneRequestsCount.push(notDoneCount);
                                    doneRequestsCount.push(doneCount);
                                }
                                break;
                            case diff <= 1:
                                for (var day = moment(dateFrom).startOf('day');
                                     day.isBefore(moment(dateTo));
                                     day.add(1, 'day')) {
                                    labels.push(moment(day).format('DD.MM'));
                                    var notDoneCount = 0,
                                        doneCount = 0,
                                        period = day;
                                    period = moment(period).endOf('day');
                                    _.forEach(notDoneRequests, function(request) {
                                        if (moment(request.createdAt).isBetween(day, period, null, '[)')) {
                                            notDoneCount++;
                                        }
                                    });
                                    _.forEach(doneRequests, function(request) {
                                        if (moment(request.updatedAt).isBetween(day, period, null, '[)')) {
                                            doneCount++;
                                        }
                                    });
                                    notDoneRequestsCount.push(notDoneCount);
                                    doneRequestsCount.push(doneCount);
                                }
                                break;
                        }
                    })
                    .then(function () {
                        res.json({
                            data: {
                                labels: labels,
                                doneRequestsCount: doneRequestsCount,
                                notDoneRequestsCount: notDoneRequestsCount
                            },
                            code: 200
                        });
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500})
                    });
            }
        });
};