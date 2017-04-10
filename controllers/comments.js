var models = require('../models');

module.exports = function (router) {
  'use strict';
  
  router.route('/')
  
        .get(function (req, res) {
          if (typeof req.query.blogComments !== undefined) {
            var blogId = Number(req.query.blogComments);
            models.wl.collections.comment.find({
              blog: blogId
            }).populate('comments')
                  .populate('inhabitant')
                  .sort('createdAt DESC')
                  .then(function (comment) {
                    res.json({data: comment, code: 200});
                  })
                  .catch(function (err) {
                    return res.json({data: err.toString(), code: 500});
                  });
          }
        })
  
        .post(function (req, res) {
          if (req.body.parentCommentId) {
            models.wl.collections.comment.find({
                    blog: req.body.blog,
                    id: req.body.parentCommentId
                  })
                  .populate('comments')
                  .exec(function (err, comment) {
                    comment[0].comments.add({
                      text: req.body.text,
                      blog: req.body.blog,
                      inhabitant: req.body.inhabitant
                    });
                    comment[0].save(function (comment) {
                      return res.json({data: 'res', code: 200});
                    })
                  }).catch(function (err) {
              return res.json({data: err.toString(), code: 500});
            });
          } else {
            models.wl.collections.comment.create({
                    text: req.body.text,
                    blog: req.body.blog,
                    inhabitant: req.body.inhabitant
                  })
                  .then(function (comment) {
                    return res.json({data: 'res', code: 200});
                  })
                  .catch(function (err) {
                    return res.json({data: err.toString(), code: 500});
                  });
          }
        })
  
        .put(function (req, res) {
          if (req.body.text) {
            models.wl.collections.comment
                  .update({
                        id: req.body.id
                      },
                      {
                        text: req.body.text,
                        editedAt: req.body.editedAt
                      })
                  .then(function (comment) {
                    res.json({data: comment, code: 200});
                  })
                  .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                  });
          } else {
            models.wl.collections.comment
                  .update({
                        id: req.body.id
                      },
                      {
                        isDeleted: req.body.isDeleted
                      })
                  .then(function (comment) {
                    res.json({data: comment, code: 200});
                  })
                  .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                  });
          }
        });
  
  router.route('/inhabitantInfo/:id')

        .get(function (req, res) {
            var userId = req.params.id;
            models.wl.collections.user.find({
                    id: userId,
                    select: ['id', 'username']
                  })
                  .populate('inhabitants')
                  .then(function (info) {
                    res.json({data: info, code: 200});
                  })
                  .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                  });
          })
};