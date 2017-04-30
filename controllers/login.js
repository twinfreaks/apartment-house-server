var models = require('../models'),
    jwt = require('jsonwebtoken'),
    Config = require('config'),
    _ = require('lodash');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .post(function (req, res, next) {
            models.wl.collections.user.findOne({
                username: req.body.username,
                or: [
                    {
                        isDeleted: false
                    },
                    {
                        isDeleted: null
                    }
                ]
            }).populate('roles')
                .populate('inhabitants')
                .populate('admins')
                .then(function (user) {
                    if (user) {
                        if (user.password === models.wl.collections.user.hashPassword(req.body.password)) {
                            models.wl.collections.userlogs.create({
                                lastLogin: new Date(),
                                ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                                browser: req.useragent["browser"]+" "+req.useragent["version"],
                                operatingSystem: req.useragent.platform+" "+req.useragent.os,
                                user: user.id
                            }).then(function(){
                                var rolesArr = _.map(user.roles, 'name');
                                var jwtSign = jwt.sign(
                                    {
                                        iat: Date.now(),
                                        exp: parseInt(Date.now() + parseInt(Config.get("auth.jwtExpTime"))),
                                        sub: user.id,
                                        iss: req.headers.host,
                                        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                                        username: user.username,
                                        roles: rolesArr,
                                        admin: user.admins.length != 0 ? user.admins[0].id : null,
                                        inhabitant: user.inhabitants.length != 0 ? user.inhabitants[0].id : null,
                                        isInhabitantActive: user.inhabitants.length != 0 ? user.inhabitants[0].isActive : false,
                                        isOauth: user.isOauth
                                    }, Config.get("auth.jwtPrivateKey"));
                                res.json({data: "Logged in", token: jwtSign, code: 200});
                            });
                        }
                        else {
                            res.json({data: "Wrong password", code: 500});
                        }
                    }
                    else {
                        res.json({data: "User not found", code: 404});
                    }
                }).catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
        });
};
