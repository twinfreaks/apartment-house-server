var changeCase = require('change-case'),
    express = require('express'),
    routes = require('require-dir')(),
    boom = require('express-boom');

module.exports = function (app) {
    'use strict';

    Object.keys(routes).forEach(function (routeName) {
        var router = express.Router();

        app.use(function (err, req, res, next) {
            if (err.name === 'UnauthorizedError') {
                res.status(401, 'Invalid JWT token');
            }
        });

        require('./' + routeName)(router);
        app.use('/' + changeCase.paramCase(routeName), router);
    });
};