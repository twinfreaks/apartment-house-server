var models = require('../models'),
    _ = require('lodash'),
    fs = require('fs'),
    Config = require('config'),
    isprofanity = require('isprofanity'),
    sensitivityPath = Config.get("profanity.sensitivityPath"),
    customSensitivity = require("../profanity/sensitivity.json").sens,
    profanityWords = Config.get("profanity.profanityWords"),
    exceptionWords = Config.get("profanity.exceptionWords"),
    profanityWords2 = Config.get("profanity.profanitySecondaryWords"),
    profanityFile,
    profanityFlag,
    text;

module.exports = function (router) {
  'use strict';
  createFiles();
  
  router.route('/')
  
        .get(function (req, res) {
          if (typeof req.query.blogComments !== undefined) {
            var blogId = Number(req.query.blogComments);
            models.wl.collections.comment.find({
              blog: blogId
            }).populate('comments')
                  .populate('inhabitant')
                  .populate('admin')
                  .sort('createdAt DESC')
                  .then(function (comment) {
                    res.json({data: comment, code: 200});
                  })
                  .catch(function (err) {
                    profanityFlag = false;
                    return res.json({data: err.toString(), code: 500});
                  });
          }
          createFiles();
        })
  
        .post(function (req, res) {
          customSensitivity = JSON.parse(fs.readFileSync(sensitivityPath)).sens;
              // first profanity filter
          isprofanity(req.body.text, function (t) {
            if (t) {
              return res.json({data: 'res', code: 201});
            } else {
              // second profanity filter
              // read profanity2 vocabulary
              fs.readFile(profanityWords2, function (err, contents) {
                // check if vocabulary exists
                if (fs.existsSync(profanityWords2)) {
                  text = req.body.text;
                  _.forEach(req.body.text, function () {
                    text = text.replace(" ", "");
                  });
                  if (contents.length) {
                    profanityFile = _.split(contents.toString(), ',');
                    var fileLength = profanityFile.length;
                    while (fileLength !== 0 && profanityFile[0].length === 0) {
                      fileLength--;
                      profanityFile.shift();
                    }
                    _.forEach(profanityFile, function (word) {
                      if ((_.includes(text, word)) && word.length !== 0) {
                        profanityFlag = true;
                      }
                    });
                  }
                }
                if (!profanityFlag) {
                  if (req.body.parentCommentId) {
                    var commentSingle;
                    models.wl.collections.comment.find({
                            blog: req.body.blog,
                            id: req.body.parentCommentId
                          })
                          .populate('comments')
                          .then(function (comment) {
                            commentSingle = comment[0];
                            return comment[0].comments.add({
                              text: req.body.text,
                              blog: req.body.blog,
                              inhabitant: req.body.inhabitant,
                              admin: req.body.admin
                            });
                          })
                          .then(function () {
                            return commentSingle.save();
                          })
                          .then(function () {
                            return res.json({data: 'res', code: 200});
                          })
                          .catch(function (err) {
                            return res.json({data: err.toString(), code: 500});
                          });
                  } else {
                    models.wl.collections.comment.create({
                            text: req.body.text,
                            blog: req.body.blog,
                            inhabitant: req.body.inhabitant,
                            admin: req.body.admin
                          })
                          .then(function (comment) {
                            return res.json({data: 'res', code: 200});
                          })
                          .catch(function (err) {
                            return res.json({data: err.toString(), code: 500});
                          });
                  }
                } else {
                  profanityFlag = false;
                  return res.json({data: 'res', code: 201});
                }
              });
            }
          }, profanityWords, exceptionWords, customSensitivity);
        })
  
        .put(function (req, res) {
          // hide comment from view
          if (!req.body.text) {
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
          // edit comment
          else {
            // first profanity filter
            customSensitivity = JSON.parse(fs.readFileSync(sensitivityPath)).sens;
            isprofanity(req.body.text, function (t) {
              if (t) {
                return res.json({data: 'res', code: 201});
              } else {
                // second profanity filter
                fs.readFile(profanityWords2, function (err, contents) {
                  // check if vocabulary exists
                  if (fs.existsSync(profanityWords2)) {
                    text = req.body.text;
                    _.forEach(req.body.text, function () {
                      text = text.replace(" ", "");
                    });
                    if (contents.length) {
                      profanityFile = _.split(contents.toString(), ',');
                      var fileLength = profanityFile.length;
                      while (fileLength !== 0 && profanityFile[0].length === 0) {
                        fileLength--;
                        profanityFile.shift();
                      }
                      _.forEach(profanityFile, function (word) {
                        if ((_.includes(text, word)) && word.length !== 0) {
                          profanityFlag = true;
                        }
                      });
                    }
                  }
                  if (!profanityFlag) {
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
                    profanityFlag = false;
                    return res.json({data: 'res', code: 201});
                  }
                });
              }
            }, profanityWords, exceptionWords, customSensitivity);
          }
        });
  
  router.route('/inhabitantInfo/:id')
  
        .get(function (req, res) {
          var userId = req.params.id;
          models.wl.collections.user.find({
                  id: userId,
                  select: ['id', 'username']
                })
                .populate('admins')
                .populate('inhabitants')
                .then(function (info) {
                  res.json({data: info, code: 200});
                })
                .catch(function (err) {
                  res.json({data: err.toString(), code: 500});
                });
        });
  
  router.route('/adminInfo/:id')
  
        .get(function (req, res) {
          var userId = req.params.id;
          models.wl.collections.admin.find({
                  id: userId,
                  select: ['surname', 'name']
                })
                .then(function (info) {
                  res.json({data: info, code: 200});
                })
                .catch(function (err) {
                  res.json({data: err.toString(), code: 500});
                });
        });
  
};

// create empty vocabularies if not exists
var createFiles = function () {
  if (!fs.existsSync(profanityWords)) {
    fs.appendFileSync(profanityWords, '');
  } else if (!fs.existsSync(exceptionWords)) {
    fs.appendFileSync(exceptionWords, '');
  } else if (!fs.existsSync(profanityWords2)) {
    fs.appendFileSync(profanityWords2, '');
  }
};