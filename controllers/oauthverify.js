var models = require('../models'),
    requestHTTP = require('request'),
    Config = require("config"),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    Promise = require('bluebird');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .post(function (req, res, next) {
            if (typeof req.body.oauthServer === 'undefined') {
                return res.json({data: "You must provide oAuthServer field", code: 500});
            }
            switch (req.body.oauthServer) {
                case "google":
                    googleVerification(req, res);
                    break;
                case "fb":
                    fbVerification(req, res);
                    break;
                default:
                    errorOAuth(req, res);
            }
        });
    function errorOAuth(req, res) {
        return res.json({data: "error occured", code: 500});
    }
    function fbVerification(req, res) {
        var options = {
            method: "GET",
            url: Config.get("oAuth.fb.oAuthGraphApi")
                    + "?access_token=" + req.body.token
                    + "&fields=email,name",
            headers: {
                "Accept": "text/json",
                "Content-Type": "application/json"
            }
        };
        requestHTTP(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var response = JSON.parse(body);
                isUserRegistrated(response.email, response.id, req)
                    .then(function(result){
                        return res.json({data: result, code: 200});
                    })
                    .catch(function(err){
                        return res.json({data: err.toString(), code: 50});
                    });
            }
        });
    }
    function googleVerification(req, res) {
        var options = {
            method: "GET",
            url: Config.get("oAuth.google.oAuthTokenInfoEndpoint")
                    + "?access_token=" + req.body.token,
            headers: {
                "Accept": "text/json",
                "Content-Type": "application/json"
            }
        };
        requestHTTP(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var response = JSON.parse(body);
                isUserRegistrated(response.email, response.id, req)
                    .then(function(result){
                        return res.json({data: result, code: 200});
                    })
                    .catch(function(err){
                        return res.json({data: err.toString(), code: 50});
                    });
            }
        });
    }
    function isUserRegistrated(email, userId, req) {
        return new Promise(function(resolve, reject){
            models.wl.collections.user.findOne({
                email: email
            }).populate('roles')
                .populate('inhabitants')
                .populate('admins')
                .then(function (user) {
                    if (user) {
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
                                isInhabitantActive: user.inhabitants.length != 0 ? user.inhabitants[0].isActive : false
                            }, Config.get("auth.jwtPrivateKey"));

                        return resolve({type: "REGISTERED", token: jwtSign, email: email});
                    }
                    else {
                        return resolve({type: "NOT_FOUND", token: null, email: email});
                    }
                }).catch(function (err) {
                    return reject(err.toString());
            });
        });
    }
};