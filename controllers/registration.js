var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .post(function (req, res, next) {
            if (typeof req.body.registrationType === 'undefined') {
                return res.json({data: "You must pass regidstration type", code: 500});
            }
            var userCreateFields;
            switch (req.body.registrationType) {
                case "native":
                    userCreateFields = {
                        username: req.body.inhabitant.phone.replace(/[^0-9.]/g, ""),
                        password: req.body.userData.password,
                        email: req.body.inhabitant.email,
                        isOauth: false
                    };
                    break;
                case "oAuth":
                    userCreateFields = {
                        username: req.body.inhabitant.email,
                        email: req.body.inhabitant.email,
                        isOauth: true
                    };
                    break;
            }
            var userTop;
            models.wl.collections.user.create(userCreateFields)
                .then(function (user) {
                    userTop = user;
                    return models.wl.collections.role.findOne({
                        name: "inhabitant"
                    });
                })
                .then(function (role) {
                    userTop.roles.add(role.id);
                    userTop.inhabitants.add({
                        surname: req.body.inhabitant.surname,
                        name: req.body.inhabitant.name,
                        patronymic: req.body.inhabitant.patronymic,
                        phoneNumber: req.body.inhabitant.phone.replace(/[^0-9.]/g, ""),
                        email: req.body.inhabitant.email,
                        appartment: req.body.inhabitant.appartment,
                        building: req.body.inhabitant.building[0].id,
                        isActive: false
                    });
                    return userTop.save();
                }).then(function () {
                return res.json({data: "Saved", code: 200});
            }).catch(function (err) {
                return res.json({data: err.toString(), code: 500});
            });
        });
};