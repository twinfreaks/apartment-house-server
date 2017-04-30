var models = require('../models'),
    Config = require('config'),
    _ = require('lodash'),
    pathmod = require('path'),
    multiparty = require('multiparty'),
    random = require(__dirname + '/../utils/random'),
    fs = require('fs'),
    Promise = require('bluebird'),
    profanityWords = Config.get("profanity.profanityWords"),
    exceptionWords = Config.get("profanity.exceptionWords"),
    profanitySecondaryWords = Config.get("profanity.profanitySecondaryWords"),
    sensitivity = Config.get("profanity.sensitivityPath"),
    sens = require("../profanity/sensitivity.json").sens,
    vocabName;

module.exports = function (router) {
  'use strict';
  
  router.route('/upload')
        .post(function (req, res, next) {
          if (req.query.vocabulary === '1') {
            vocabName = 'profanity.csv';
          } else if (req.query.vocabulary === '2') {
            vocabName = 'profanity2.csv';
          } else if (req.query.vocabulary === '3') {
            vocabName = 'exceptions.csv';
          }
          var form = new multiparty.Form();
          form.parse(req, function (err, fields, files) {
            if (files.file) {
              fs.open("./profanity", 'r', function (err) {
                if (err && err.code === 'ENOENT') {
                  return res.json({data: "Destination can't be reached", code: 500});
                }
                else {
                  var filesUploaded = [],
                      errors = [],
                      // name = 'profanity.csv',
                      sourcePath = files.file[0].path,
                      destinationPath = "./profanity/" + vocabName,
                      source = fs.createReadStream(sourcePath),
                      dest = fs.createWriteStream(destinationPath);
                  source.pipe(dest);
                  source.on('error', function (err) {
                    console.error(err);
                    errors.push(err);
                  });
                  source.on('end', function (err) {
                    return res.json({data: "uploaded", code: 200});
                  });
                }
              });
            }
            else {
              return res.json({data: "You must send your files in file array of field"});
            }
          });
        });
  
  router.route('/add')
        .post(function (req, res) {
          if (req.body.profanity) {
            fs.appendFileSync(profanityWords, req.body.profanity + ',');
            return res.json({data: 'profanity', code: 200});
          } else if (req.body.exceptions) {
            fs.appendFileSync(exceptionWords, req.body.exceptions + ',');
            return res.json({data: 'exceptions', code: 200});
          } else if (req.body.profanity2) {
            fs.appendFileSync(profanitySecondaryWords, req.body.profanity2 + ',');
            return res.json({data: 'profanity2', code: 200});
          } else {
            return res.json({data: err.toString(), code: 500});
          }
        });
  
  router.route('/download/:id')
        .get(function (req, res) {
          if (req.params.id === "1") {
            res.download(profanityWords, 'profanity_vocabulary.csv');
          } else if (req.params.id === "2") {
            res.download(exceptionWords, 'exceptions_vocabulary.csv');
          } else if (req.params.id === "3") {
            res.download(profanitySecondaryWords, 'profanity_secondary_vocabulary.csv');
          }
        });
  
  
  router.route('/sensitivity/:id')
  
        .put(function (req, res) {
          fs.writeFile(sensitivity, '{"sens": ' + (req.params.id / 100).toFixed(2) + '}', function (err) {
            if (err) {
              return console.error(err);
            } else {
              res.json({data: req.params.id, code: 200});
            }
          });
        });
  
  router.route('/sensitivity')
  
        .get(function (req, res, err) {
          fs.readFile(sensitivity, function (err, contents) {
            sens = JSON.parse(contents.toString()).sens;
            res.json({data: (sens * 100).toFixed(0), code: 200})
          });
        })
  
};