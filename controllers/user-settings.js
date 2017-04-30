var models = require('../models'),
    moment = require('moment');

module.exports = function (router) {
    'use strict';

        router.route('/')
        .post(function (req, res, next) {
            models.wl.collections.userconfig.findOne({
                userID: req.user.sub
            }).then(function (userconfig) {
                if (typeof userconfig !== "undefined") {
                    models.wl.collections.userconfig.update(
                        {
                        userID: req.user.sub
                        },
                        {
                            theme: req.body.theme
                        }
                    ).then(function(){
                        return res.json({data: "updated theme", code: 200});
                    }).catch(function(err){
                        return res.json({data: err.toString(), code: 500});
                    });
                }
                else {
                    models.wl.collections.userconfig.create(
                        {
                            userID: req.user.sub,
                            viewBlogs: true,
                            viewEvents: true,
                            viewCalculations: true,
                            viewProtocols: true,
                            blogsCount: 3,
                            eventsCount: 3,
                            protocolsCount: 3,
                            viewOrder: "[1, 2, 3, 4]",
                            theme: req.body.theme
                        }
                    ).then(function(){
                        return res.json({data: "created theme", code: 200});
                    }).catch(function(err){
                        return res.json({data: err.toString(), code: 500});
                    });
                }
            })
        })
        .get(function (req, res, next) {
            models.wl.collections.userconfig.findOne({
                userID: req.user.sub
            }).then(function(userConfig) {
                if (typeof userConfig === "undefined") {
                    return models.wl.collections.userconfig.create(
                        {
                            userID: req.user.sub,
                            viewBlogs: true,
                            viewEvents: true,
                            viewCalculations: true,
                            viewProtocols: true,
                            blogsCount: 3,
                            eventsCount: 3,
                            protocolsCount: 3,
                            viewOrder: "[1, 2, 3, 4]",
                            theme: "default"
                        });
                }
                return userConfig;
            }).then(function(userConfig){
                return res.json({data: userConfig, code: 200});

            }).catch(function(err){
                return res.json({data: err.toString(), code: 500});
            })
        })
};