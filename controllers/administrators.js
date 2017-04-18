var models = require('../models'),
    moment = require('moment'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    rolesAccepted = ["superAdmin"];

module.exports = function (router) {
    'use strict';

    var querySelectAllAdmins = 'SELECT "admin".surname, "admin".name, "admin".patronymic, "admin".id, "user".id as "userId", "user".username, "role".name as "roleName", "role".id AS "roleId" ' +
        'FROM "admin" ' +
        'LEFT JOIN "user" ON "admin".user = "user".id ' +
        'LEFT JOIN "role_users__user_roles" ON "user".id = "role_users__user_roles".user_roles ' +
        'LEFT JOIN role ON "role_users__user_roles".role_users = "role".id';

    router.route('/:id')
        .get(function (req, res, next) {
            var query = querySelectAllAdmins + ' WHERE "admin"."id" = ' + req.params.id;
            var adminQuery = Promise.promisify(models.wl.collections.admin.query);
            adminQuery(query, []).then(function (administrators) {
                return res.json({data: administrators.rows[0], code: 200});
            }).catch(function (err) {
                return res.json({data: err.toString(), code: 500});
            });
        })
        .put(function (req, res, next) {
            var userTop,
                updateUserObj = {
                    "username": req.body.username,
                    "email": req.body.username + "@email.com"
                };
            if (req.body.createPassword === true && typeof req.body.password !== "undefined") {
                updateUserObj.password = models.wl.collections.user.hashPassword(req.body.password);
            }

            models.wl.collections.admin.update({
                id: req.params.id
            }, {
                "surname": req.body.surname,
                "name": req.body.name,
                "patronymic": req.body.patronymic
            }).then(function (admin) {
                return models.wl.collections.user.update({
                    id: admin[0].user
                }, updateUserObj);
            }).then(function (user) {
                var userOne;
                models.wl.collections.user.findOne({
                    id: user[0].id
                }).populate('roles')
                .then(function (user) {
                    userOne = user;
                    userOne.roles.remove(userOne.roles[0].id);
                    return userOne.save();
                }).then(function () {
                    userOne.roles.add(req.body.role);
                    return userOne.save();
                });
            }).then(function () {
                return res.json({data: "Updated", code: 200});
            }).catch(function (err) {
                return res.json({data: err.toString(), code: 500});
            });
        })
        .delete(function (req, res, next) {
            var adminId;

            models.wl.collections.admin.findOne({
                id: req.params.id
            }).then(function (admin) {
                adminId = admin.id;
                return models.wl.collections.user.destroy({
                    id: admin.user
                });
            }).then(function () {
                return models.wl.collections.admin.destroy({
                    id: adminId
                });
            }).then(function () {
                return res.json({data: "deleted", code: 200});
            }).catch(function (err) {
                return res.json({data: err.toString(), code: 500});
            })
        });

    router.route('/')
        .post(function (req, res, next) {
            if (req.body.password != req.body.passwordRepeat) {
                return res.json({data: "Passwords doesn't coincide", code: 500});
            }
            var userTop,
                password = req.body.password;
            if (req.body.createPassword === false) {
                password = req.body.username;
            }
            models.wl.collections.user.create({
                "username": req.body.username,
                "password": password,
                "email": req.body.username + "@email.com"
            }).then(function (user) {
                userTop = user;
                userTop.roles.add(req.body.role);
                return userTop.save();
            }).then(function () {
                return models.wl.collections.admin.create({
                    "surname": req.body.surname,
                    "name": req.body.name,
                    "patronymic": req.body.patronymic,
                    "user": userTop.id
                });
            }).then(function () {
                return res.json({data: "Saved", code: 200});
            }).catch(function (err) {
                return res.json({data: err.toString(), code: 500});
            });
        })
        .get(function (req, res, next) {
            var query = querySelectAllAdmins;
            var adminQuery = Promise.promisify(models.wl.collections.admin.query);
            adminQuery(query, []).then(function (administrators) {
                return res.json({data: administrators.rows, code: 200});
            }).catch(function (err) {
                return res.json({data: err.toString(), code: 500});
            });
        })
};