var models = require('../models'),
    _ = require('lodash');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res) {
            if (req.query.type === 'getCfg') {
                models.wl.collections.userconfig
                    .findOne({
                        userID: req.params.id
                    })
                    .then(function (item) {
                        res.json({
                            data: {
                                userID: item.userID,
                                viewBlogs: item.viewBlogs,
                                viewEvents: item.viewEvents,
                                viewCalculations: item.viewCalculations,
                                viewProtocols: item.viewProtocols,
                                blogsCount: item.blogsCount,
                                eventsCount: item.eventsCount,
                                calculationsCount: item.calculationsCount,
                                protocolsCount: item.protocolsCount,
                                viewOrder: item.viewOrder
                            }, code: 200
                        });
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500})
                    });
            }
            if (typeof req.query.type !== 'undefined' && req.query.type === 'unreadedBlogs') {
                var inhabitantBlogsTop;
                models.wl.collections.inhabitant
                    .findOne({
                        id: req.params.id
                    })
                    .populate('blogs')
                    .then(function (inhabitantBlogs) {
                        inhabitantBlogsTop = inhabitantBlogs;
                        return models.wl.collections.blog.find({isDeleted: false})
                    })
                    .then(function (blogs) {
                        var inhabitantBlogsCount = inhabitantBlogsTop.blogs.length;
                        return (blogs.length - inhabitantBlogsCount);
                    })
                    .then(function (unreadedBlogsCount) {
                        return res.json({data: unreadedBlogsCount, code: 200})
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500});
                    })
            } else {
                if (typeof req.query.type !== 'undefined' && req.query.type === 'unreadedEvents') {
                    var inhabitantEventsTop;
                    models.wl.collections.inhabitant
                        .findOne({
                            id: req.params.id
                        })
                        .populate('events')
                        .then(function (inhabitantEvents) {
                            inhabitantEventsTop = inhabitantEvents;
                            return models.wl.collections.event.find({isDeleted: false})
                        })
                        .then(function (events) {
                            var inhabitantEventsCount = inhabitantEventsTop.events.length;
                            return (events.length - inhabitantEventsCount);
                        })
                        .then(function (unreadedEventsCount) {
                            return res.json({data: unreadedEventsCount, code: 200})
                        })
                        .catch(function (err) {
                            res.json({data: err.toString(), code: 500});
                        })
                } else {
                    if (typeof req.query.type !== 'undefined' && req.query.type === 'unreadedProtocols') {
                        var inhabitantProtocolsTop;
                        models.wl.collections.inhabitant
                            .findOne({
                                id: req.params.id
                            })
                            .populate('protocols')
                            .then(function (inhabitantProtocols) {
                                inhabitantProtocolsTop = inhabitantProtocols;
                                return models.wl.collections.protocol.find({isDeleted: false})
                            })
                            .then(function (protocols) {
                                var inhabitantProtocolsCount = inhabitantProtocolsTop.protocols.length;
                                return (protocols.length - inhabitantProtocolsCount);
                            })
                            .then(function (unreadedProtocolsCount) {
                                return res.json({data: unreadedProtocolsCount, code: 200})
                            })
                            .catch(function (err) {
                                res.json({data: err.toString(), code: 500});
                            })
                    } else {
                        if (typeof req.query.type !== 'undefined' && req.query.type === 'unreadedCalculations') {
                            var inhabitantCalculationsTop;
                            models.wl.collections.inhabitant
                                .findOne({
                                    id: req.params.id
                                })
                                .populate('calculation')
                                .then(function (inhabitantCalculations) {
                                    inhabitantCalculationsTop = inhabitantCalculations;
                                    return models.wl.collections.calculation.count();
                                })
                                .then(function (calculationsCount) {
                                    var inhabitantCalculationsCount = inhabitantCalculationsTop.calculation.length;
                                    return (calculationsCount - inhabitantCalculationsCount);
                                })
                                .then(function (unreadedCalculationsCount) {
                                    return res.json({data: unreadedCalculationsCount, code: 200})
                                })
                                .catch(function (err) {
                                    res.json({data: err.toString(), code: 500});
                                })
                        }
                    }
                }
            }
        });

    router.route('/')
        .get(function (req, res) {
            var table = models.wl.collections,
                uniqCalcs;

            function getLastItem(item) {
                if (item === table.calculation) {
                    item.find({
                        sort: 'date DESC',
                        inhabitant: req.query.inhabitant
                    })
                        .then(function (notUniq) {
                            return _.uniqBy(notUniq, 'calculationType')
                        })
                        .then(function (calcs) {
                            uniqCalcs = calcs;
                            return table.calculationtype.find({sort: 'id ASC'})
                        })
                        .then(function (types) {
                            res.json({
                                data: uniqCalcs,
                                dataTypes: types,
                                code: 200
                            });
                        })
                        .catch(function (err) {
                            res.json({data: err.toString(), code: 500})
                        });
                } else {
                    item.find({
                        isDeleted: false,
                        sort: 'updatedAt DESC',
                        limit: req.query.limit
                    })
                        .then(function (item) {
                            res.json({data: item, code: 200});
                        })
                        .catch(function (err) {
                            res.json({data: err.toString(), code: 500})
                        });
                }
            }

            if (typeof req.query.type !== 'undefined') {
                switch (req.query.type) {
                    case 'lastBlog': {
                        getLastItem(table.blog);
                        break;
                    }
                    case 'lastEvent': {
                        getLastItem(table.event);
                        break;
                    }
                    case 'lastProtocol': {
                        getLastItem(table.protocol);
                        break;
                    }
                    case 'lastCalculation': {
                        getLastItem(table.calculation);
                        break;
                    }
                }
            }
        })

        .post(function (req, res) {
            switch (req.query.type) {
                case 'viewProtocol': {
                    models.wl.collections.inhabitant_protocols__protocol_inhabitants
                        .findOne({
                            inhabitant_protocols: req.query.inhab,
                            protocol_inhabitants: req.query.thing
                        })
                        .then(function (item) {
                            if (typeof req.query.type !== 'undefined' && req.query.type === 'viewProtocol' && !item) {
                                models.wl.collections.inhabitant_protocols__protocol_inhabitants
                                    .create({
                                        inhabitant_protocols: req.query.inhab,
                                        protocol_inhabitants: req.query.thing
                                    })
                                    .then(function (inhab_prot) {
                                        res.json({data: inhab_prot, code: 200})
                                    })
                                    .catch(function (err) {
                                        res.json({data: err.toString(), code: 500})
                                    });
                            }
                        });
                    break;
                }
                case 'viewBlog': {
                    models.wl.collections.blog_inhabitants__inhabitant_blogs
                        .findOne({
                            inhabitant_blogs: req.query.inhab,
                            blog_inhabitants: req.query.thing
                        })
                        .then(function (item) {
                            if (typeof req.query.type !== 'undefined' && req.query.type === 'viewBlog' && !item) {
                                models.wl.collections.blog_inhabitants__inhabitant_blogs
                                    .create({
                                        inhabitant_blogs: req.query.inhab,
                                        blog_inhabitants: req.query.thing
                                    })
                                    .then(function (inhab_blog) {
                                        res.json({data: inhab_blog, code: 200})
                                    })
                                    .catch(function (err) {
                                        res.json({data: err.toString(), code: 500})
                                    });
                            }
                        });
                    break;
                }
                case 'viewEvent': {
                    models.wl.collections.event_inhabitants__inhabitant_events
                        .findOne({
                            inhabitant_events: req.query.inhab,
                            event_inhabitants: req.query.thing
                        })
                        .then(function (item) {
                            if (typeof req.query.type !== 'undefined' && req.query.type === 'viewEvent' && !item) {
                                models.wl.collections.event_inhabitants__inhabitant_events
                                    .create({
                                        inhabitant_events: req.query.inhab,
                                        event_inhabitants: req.query.thing
                                    })
                                    .then(function (inhab_event) {
                                        res.json({data: inhab_event, code: 200})
                                    })
                                    .catch(function (err) {
                                        res.json({data: err.toString(), code: 500})
                                    });
                            }
                        });
                    break;
                }
                case 'viewCalculation': {
                    models.wl.collections.calculation_inhabitants__inhabitant_calculation
                        .findOne({
                            inhabitant_calculation: req.query.inhab,
                            calculation_inhabitants: req.query.thing
                        })
                        .then(function (item) {
                            if (typeof req.query.type !== 'undefined' && req.query.type === 'viewCalculation' && !item) {
                                models.wl.collections.calculation_inhabitants__inhabitant_calculation
                                    .create({
                                        inhabitant_calculation: req.query.inhab,
                                        calculation_inhabitants: req.query.thing
                                    })
                                    .then(function (inhab_calc) {
                                        res.json({data: inhab_calc, code: 200});
                                    })
                                    .catch(function (err) {
                                        res.json({data: err.toString(), code: 500})
                                    });
                            }
                        });
                    break;
                }
            }
        })
        .put(function (req, res) {
            models.wl.collections.userconfig.findOne({
                userID: req.body.userID
            })
                .then(function (result) {
                    if (!result) {
                        models.wl.collections.userconfig
                            .create({
                                userID: req.body.userID,
                                viewBlogs: req.body.viewBlogs,
                                viewEvents: req.body.viewEvents,
                                viewCalculations: req.body.viewCalculations,
                                viewProtocols: req.body.viewProtocols,
                                blogsCount: req.body.blogsCount,
                                eventsCount: req.body.eventsCount,
                                calculationsCount: req.body.calculationsCount,
                                protocolsCount: req.body.protocolsCount,
                                viewOrder: req.body.viewOrder
                            })
                            .then(function (config) {
                                res.json({
                                    data: config, code: 200
                                })
                            })
                            .catch(function (err) {
                                res.json({
                                    data: err.toString(), code: 500
                                })
                            });
                    } else {
                        models.wl.collections.userconfig
                            .update({
                                    userID: req.body.userID
                                },
                                {
                                    viewBlogs: req.body.viewBlogs,
                                    viewEvents: req.body.viewEvents,
                                    viewCalculations: req.body.viewCalculations,
                                    viewProtocols: req.body.viewProtocols,
                                    blogsCount: req.body.blogsCount,
                                    eventsCount: req.body.eventsCount,
                                    calculationsCount: req.body.calculationsCount,
                                    protocolsCount: req.body.protocolsCount,
                                    viewOrder: req.body.viewOrder
                                })
                            .then(function (blog) {
                                res.json({
                                    data: blog, code: 200
                                })
                            })
                            .catch(function (err) {
                                res.json({
                                    data: err.toString(), code: 500
                                })
                            });
                    }
                })
        })
};