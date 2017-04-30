var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res) {
            models.wl.collections.event
                .findOne({
                    id: req.params.id
                })
                .then(function (event) {
                    res.json(
                        {
                            data: event,
                            code: 200
                        }
                    );
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        })
        .put(function (req, res) {
            models.wl.collections.event
                .update({
                        id: req.params.id
                    },
                    {
                        title: req.body.title,
                        description: req.body.description,
                        start: req.body.start,
                        end: req.body.end
                    }
                )
                .then(function (event) {
                    res.json({
                        data: event, code: 200
                    });
                })
                .catch(function (err) {
                    res.json({
                        data: err.toString(), code: 500
                    });
                });
        })
        .delete(function (req, res) {
            models.wl.collections.event
                .update(
                    {id: req.params.id},
                    {isDeleted: true})
                .then(function () {
                    res.json({data: "Deleted", code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        });

    router.route('/')
        .get(function (req, res) {
          if(req.query.isOAuth === 'false'){
            models.wl.collections.event
              .find({
                isDeleted: {'!': 'true'}
              })
              .then(function (events) {
                res.json({
                  data: events, code: 200
                });
              }).catch(function (err) {
              res.json({
                data: err.toString(), code: 500
              });
            });
          } else {
            if(typeof req.query.inhabitant != 'undefined'){
              models.wl.collections.event
                .find({
                  isDeleted: {'!': 'true'}
                })
                .populate('eventgoogles', {where: {inhabitant: req.query.inhabitant}})
                .then(function (events) {
                  res.json({
                    data: events, code: 200
                  });
                }).catch(function (err) {
                res.json({
                  data: err.toString(), code: 500
                });
              });
            } else {
              res.json({
                data: 'must provide with inhabitant id', code: 500
              });
            }
          }
        })
        .post(function (req, res) {
            models.wl.collections.event
                .create({
                    title: req.body.title,
                    description: req.body.description,
                    start: req.body.start,
                    end: req.body.end
                })
                .then(function (event) {
                    res.json({
                        data: event, code: 200
                    });
                })
                .catch(function (err) {
                    res.json({
                        data: err.toString(), code: 500
                    });
                });
        });
};