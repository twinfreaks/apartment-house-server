var models = require('../models'),
    nodemailer = require('nodemailer'),
    EmailTemplate = require('email-templates').EmailTemplate,
    path = require("path"),
    randomNumber = require(__dirname + '/../utils/random-between'),
    moment = require('moment'),
    Config = require('config');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .post(function (req, res, next) {
            if (typeof req.body.type === 'undefined') {
                return res.json({data: "You must provide type param", code: 500});
            }
            switch (req.body.type) {
                case "byEmail":
                    restoreBy(req, res, "email");
                    break;
                case "byPhone":
                    restoreBy(req, res, "phone");
                    break;
                case "byBuilding":
                    break;
                case "checkCode":
                    checkCode(req, res);
                    break;
                case "restorePassword":
                    restorePassword(req, res);
                    break;
                default:
                    return res.json({data: "Type not found", code: 500});
            }
        });
    function restoreBy(req, res, type) {
        var searchBy;
        if (type === 'email') {
            searchBy = {
                "email": req.body.email
            }
        }
        else if (type === 'phone') {
            searchBy = {
                "phoneNumber": req.body.phone
            }
        }
        models.wl.collections.inhabitant.find(searchBy)
            .then(function (inhabitants) {
                if (inhabitants.length == 0) {
                    return res.json({data: "Not found", code: 404});
                }
                else {
                    var code = randomNumber(10000000, 99999999),
                        repicient,
                        messageType,
                        templateType;
                    if (type === 'email') {
                        repicient = inhabitants[0].email;
                        messageType = 'email';
                        templateType = 'remind-password';
                    }
                    else if (type === 'phone') {
                        repicient = inhabitants[0].phoneNumber;
                        messageType = 'sms';
                        templateType = 'remind-password-sms';
                    }
                    return models.wl.collections.message_queue.create({
                        recipient: repicient,
                        type: messageType,
                        sendType: templateType,
                        plannedAt: moment().format(),
                        state: 'NEW',
                        lang: req.body.lang,
                        data: {
                            code: code,
                            inhabitant: {
                                surname: inhabitants[0].surname,
                                name: inhabitants[0].name
                            }
                        }
                    }).then(function () {
                        return models.wl.collections.user.update(
                            {
                                id: inhabitants[0].user
                            },
                            {
                                passwordRestoreToken: code,
                                passwordRestoreTokenDate: moment().format()
                            }
                        ).then(function () {
                            return res.json({data: "Email/SMS sent", code: 200});
                        }).catch(function (err) {
                            return res.json({data: err.toString(), code: 500});
                        })
                    }).catch(function (err) {
                        return res.json(err.toString());
                    })
                }
            })
            .catch(function (err) {
                res.json({data: err.toString(), code: 500});
            });
    }
    function checkCode(req, res) {
        models.wl.collections.user.find({
            passwordRestoreToken: req.body.code,
            passwordRestoreTokenDate: {
                ">": moment().subtract(Config.get("restorePswdTokenLife"), 'seconds').format()
            }
        }).then(function (users) {
            if (users.length > 0) {
                return res.json({data: "User found", code: 200});
            }
            return res.json({data: "Not found", code: 404});
        }).catch(function (err) {
            return res.json({data: err.toString(), code: 500});
        })
    }
    function restorePassword(req, res) {
        models.wl.collections.user.find({
            passwordRestoreToken: req.body.code,
            passwordRestoreTokenDate: {
                ">": moment().subtract(Config.get("restorePswdTokenLife"), 'seconds').format()
            }
        }).then(function (users) {
            if (users.length > 0) {
                return models.wl.collections.user.update(
                    {
                        id: users[0].id
                    },
                    {
                        password: models.wl.collections.user.hashPassword(req.body.password),
                        passwordRestoreToken: null,
                        passwordRestoreTokenDate: null
                    }
                ).then(function () {
                    return res.json({data: "Password changed", code: 200});
                })
            }
            return res.json({data: "Not found", code: 404});
        }).catch(function (err) {
            return res.json({data: err.toString(), code: 500});
        })
    }
};