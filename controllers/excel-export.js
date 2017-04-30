var models = require('../models'),
    moment = require('moment'),
    _ = require('lodash'),
    excel = require('node-excel-export');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .get(function (req, res) {
            if (typeof req.query.type !== 'undefined' &&
                typeof req.query.dateFrom !== 'undefined' &&
                typeof req.query.dateTo !== 'undefined' &&
                typeof req.query.lang !== 'undefined') {
                var dateFrom = req.query.dateFrom,
                    dateTo = req.query.dateTo;
                switch (req.query.type) {
                    case "byRequestTypes":
                        exportByRequestTypes(req, res);
                        break;
                    case "byRequests":
                        exportByRequests(req, res);
                        break;
                }
            }
            function exportByRequestTypes(req, res) {
                var allRequests = [],
                    dataset = [];
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
                            var type = _.find(requestTypes, ['id', Number(key)]);
                            dataset.push({request_type: type.name, request_count: value});
                        });
                        return;
                    })
                    .then(function () {
                        const styles = {
                            headerType: {
                                font: {
                                    color: {
                                        rgb: '00000000'
                                    },
                                    sz: 12,
                                    bold: true
                                }
                            },
                            headerCount: {
                                alignment: {
                                    horizontal: 'center'
                                },
                                font: {
                                    color: {
                                        rgb: '00000000'
                                    },
                                    sz: 12,
                                    bold: true
                                }
                            },
                            headerMain: {
                                alignment: {
                                    horizontal: 'center'
                                },
                                font: {
                                    color: {
                                        rgb: '00000000'
                                    },
                                    sz: 14,
                                    bold: true
                                }
                            },
                            cellAlignCenter: {
                                alignment: {
                                    horizontal: 'center'
                                }
                            }
                        };
                        const heading = [
                            [{value: (req.query.lang === 'en') ? 'Statistics by request types' : 'Статистика за типами запитів',
                              style: styles.headerMain}],
                            [{value: moment(dateFrom).format('DD.MM.YYYY') + " - " + moment(dateTo).format('DD.MM.YYYY'),
                                style: styles.headerMain}]
                        ];
                        const specification = {
                            request_type: {
                                displayName: (req.query.lang === 'en') ? 'Request types' : 'Типи запитів',
                                headerStyle: styles.headerType,
                                width: '35'
                            },
                            request_count: {
                                displayName: (req.query.lang === 'en') ? 'Request count' : 'Кількість запитів',
                                headerStyle: styles.headerCount,
                                cellStyle: styles.cellAlignCenter,
                                width: '15'
                            }
                        };
                        const merges = [
                            {start: {row: 1, column: 1}, end: {row: 1, column: 2}},
                            {start: {row: 2, column: 1}, end: {row: 2, column: 2}}
                        ];
                        const report = excel.buildExport(
                            [
                                {
                                    name: (req.query.lang === 'en') ? 'Report' : 'Звіт',
                                    heading: heading,
                                    merges: merges,
                                    specification: specification,
                                    data: dataset
                                }
                            ]
                        );
                        res.send(report);
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500})
                    });
            }
            function exportByRequests(req, res) {
                var diff = moment(dateTo).diff(dateFrom, 'months', true),
                    notDoneRequests = [],
                    doneRequests = [],
                    dataset = [];
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
                                    dataset.push({period: moment(year).format('YYYY'),
                                                  new_requests_count: notDoneCount,
                                                  done_requests_count: doneCount
                                    })
                                }
                                break;
                            case diff > 1:
                                for (var month = moment(dateFrom).startOf('month');
                                     month.isBefore(moment(dateTo));
                                     month.add(1, 'months')) {
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
                                    dataset.push({period: moment(month).format('MM.YYYY'),
                                        new_requests_count: notDoneCount,
                                        done_requests_count: doneCount
                                    })
                                }
                                break;
                            case diff <= 1:
                                for (var day = moment(dateFrom).startOf('day');
                                     day.isBefore(moment(dateTo));
                                     day.add(1, 'day')) {
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
                                    dataset.push({period: moment(day).format('DD.MM.YYYY'),
                                        new_requests_count: notDoneCount,
                                        done_requests_count: doneCount
                                    })
                                }
                                break;
                        }
                    })
                    .then(function () {
                        const styles = {
                            subHeader: {
                                alignment: {
                                    horizontal: 'center'
                                },
                                font: {
                                    color: {
                                        rgb: '00000000'
                                    },
                                    sz: 12,
                                    bold: true
                                }
                            },
                            headerMain: {
                                alignment: {
                                    horizontal: 'center'
                                },
                                font: {
                                    color: {
                                        rgb: '00000000'
                                    },
                                    sz: 14,
                                    bold: true
                                }
                            },
                            cellAlignCenter: {
                                alignment: {
                                    horizontal: 'center'
                                }
                            }
                        };
                        const heading = [
                            [{value: (req.query.lang === 'en') ? 'Statistics by requests' : 'Статистика за запитами',
                                style: styles.headerMain}],
                            [{value: moment(dateFrom).format('DD.MM.YYYY') + " - " + moment(dateTo).format('DD.MM.YYYY'),
                                style: styles.headerMain}]
                        ];
                        const specification = {
                            period: {
                                displayName: (req.query.lang === 'en') ? 'Period' : 'Період',
                                headerStyle: styles.subHeader,
                                cellStyle: styles.cellAlignCenter,
                                width: '20'
                            },
                            new_requests_count: {
                                displayName: (req.query.lang === 'en') ? 'New requests' : 'Нові запити',
                                headerStyle: styles.subHeader,
                                cellStyle: styles.cellAlignCenter,
                                width: '18'
                            },
                            done_requests_count: {
                                displayName: (req.query.lang === 'en') ? 'Done requests' : 'Виконані запити',
                                headerStyle: styles.subHeader,
                                cellStyle: styles.cellAlignCenter,
                                width: '18'
                            }
                        };
                        const merges = [
                            {start: {row: 1, column: 1}, end: {row: 1, column: 3}},
                            {start: {row: 2, column: 1}, end: {row: 2, column: 3}}
                        ];
                        const report = excel.buildExport(
                            [
                                {
                                    name: (req.query.lang === 'en') ? 'Report' : 'Звіт',
                                    heading: heading,
                                    merges: merges,
                                    specification: specification,
                                    data: dataset
                                }
                            ]
                        );
                        res.send(report);
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500})
                    });
            }
        });
};