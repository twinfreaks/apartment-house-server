var models = require('../models'),
    Config = require('config'),
    pathmod = require('path'),
    multiparty = require('multiparty'),
    random = require(__dirname + '/../utils/random'),
    fs = require('fs'),
    Promise = require('bluebird');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .post(function (req, res, next) {
            var form = new multiparty.Form();
            form.parse(req, function (err, fields, files) {
                if (files.file) {
                    if (fields.destination) {
                        fs.open("./userfiles/" + fields.destination,'r',function(err){
                            if (err && err.code=='ENOENT') {
                                return res.json({data: "Destination can't be reached", code: 500});
                            }
                            else {
                                var filesUploaded = [],
                                    errors = [];
                                return Promise.each(files.file, function (file) {
                                    return new Promise(function (resolve) {
                                        var ext = pathmod.extname(file.originalFilename),
                                            name = random(16) + "" + ext,
                                            sourcePath = file.path,
                                            destinationPath = "./userfiles/" + fields.destination + "/" + name,
                                            source = fs.createReadStream(sourcePath),
                                            dest = fs.createWriteStream(destinationPath);
                                        source.pipe(dest);
                                        source.on('error', function (err) {
                                            console.error(err);
                                            errors.push(err);
                                        });
                                        source.on('end', function (err) {
                                            var fileUploaded = {
                                                filename: name,
                                                headers: file.headers
                                            };
                                            filesUploaded.push(fileUploaded);
                                            resolve(true);
                                        });
                                    });
                                }).then(function () {
                                    return res.json(filesUploaded);
                                }).catch(function () {
                                    return res.json(errors);
                                });
                            }
                        });
                    }
                    else {
                        return res.json({data: 'You must pass destination var in POST', code: 500});
                    }
                }
                else {
                    return res.json({data: "You must send your files in file array of field"});
                }
            });
        });
};