var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/buildings')
        .get(function (req, res, next) {
            if (typeof req.query.street !== 'undefined' && typeof req.query.building !== 'undefined') {
                models.wl.collections.building.find()
                    .where({
                        'streetName': {
                            'startsWith': req.query.street
                        },
                        'buildingNumber': {
                            'startsWith': req.query.building
                        }
                    })
                    .sort('streetName ASC')
                    .sort('buildingNumber ASC')
                    .then(function (buildings) {
                        res.json({data: buildings, code: 200});
                    }).catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
            } else {
                res.json(
                    {
                        data: 'must provide with street and building',
                        code: 200
                    }
                );
            }
        });
};