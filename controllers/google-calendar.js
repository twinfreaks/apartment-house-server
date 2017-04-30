var models = require('../models');

module.exports = function (router) {
  'use strict';

  router.route('/:id')
    .get(function (req, res) {
      models.wl.collections.eventgoogle
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
    .delete(function (req, res) {
      models.wl.collections.eventgoogle
        .destroy(
          {id: req.params.id})
        .then(function () {
          res.json({data: "Deleted", code: 200});
        })
        .catch(function (err) {
          res.json({data: err.toString(), code: 500});
        });
    });

  router.route('/')
    .get(function (req, res) {
      models.wl.collections.eventgoogle
        .find()
        .then(function (events) {
          res.json({
            data: events, code: 200
          });
        }).catch(function (err) {
        res.json({
          data: err.toString(), code: 500
        });
      });
    })
    .post(function (req, res) {
      models.wl.collections.eventgoogle
        .create({
          googleId: req.body.googleId,
          event: req.body.event,
          inhabitant: req.body.inhabitant
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
