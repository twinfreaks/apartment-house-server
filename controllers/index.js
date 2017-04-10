var changeCase = require('change-case'),
    express = require('express'),
    routes = require('require-dir')(),
    jwt = require('express-jwt'),
    Config = require('config'),
    boom = require('express-boom');

module.exports = function (app) {
    'use strict';

    Object.keys(routes).forEach(function (routeName) {
        var router = express.Router();

        // app.use(jwt({
        //     secret: Config.get("auth.jwtPrivateKey")
        // })
        //     .unless({
        //         path: [
        //             '/login',
        //             '/users',
        //             '/validation',
					// '/upload'
        //         ]
        //     }));

        app.use(function (err, req, res, next) {
            if (err.name === 'UnauthorizedError') {
                res.status(401, 'Invalid JWT token');
            }
        });

        app.use(express.static('userfiles'));

        require('./' + routeName)(router);
        app.use('/' + changeCase.paramCase(routeName), router);
    });
};