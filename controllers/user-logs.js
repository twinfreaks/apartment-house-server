var models = require('../models');

module.exports = function (router) {
    'use strict';

        router.route('/')
        .get(function (req, res, next) {
           models.wl.collections.userlogs.find({
               user: req.user.sub
           }).sort('lastLogin DESC')
               .limit(5)
               .then(function (userlogs) {
               return res.json({data: userlogs, code: 200});
           }).catch(function (err) {
               return res.json({data: err.toString(), code: 500});
           })
        })
};