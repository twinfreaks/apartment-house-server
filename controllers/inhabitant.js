var models = require('../models'),
    moment = require('moment');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res, next) {
            models.wl.collections.inhabitant
                .findOne({
                    id: req.params.id
                })
                .populate('building')
                .then(function (inhabitant) {
                    res.json(
                        {
                            data: inhabitant, code: 200
                        }
                    );
                })
                .catch(function (err) {
                    res.json({
                        data: err.toString(), code: 500
                    });
                });
        })
        .put(function (req, res, next) {
            if (typeof req.body.type === 'undefined') {
                updateInhabitant(req, res);
            }
            switch (req.body.type) {
                case "setActive":
                    setActiveInhabitant(req, res);
                    break;
                case "setInActive":
                    setInActiveInhabitant(req, res);
                    break;
                case "setDeleted":
                    setDeletedInhabitant(req, res);
                    break;
                case "changePhoto":
                    changePhoto(req, res);
                	break;
            }
            function changePhoto(req, res) {
             models.wl.collections.inhabitant
                .update({
                        id: req.params.id
                    },
                    {
                        photo: req.body.photo
                    })
                .then(function (inhabitant) {
                    res.json({
                        data: inhabitant, code: 200
                    });
                })
                .catch(function (err) {
                    res.json({
                        data: err.toString(), code: 500
                    });
                });
            }
            function setInActiveInhabitant(req, res) {
                var inhabitantTop,
                    langTop = req.body.lang,
                    typeMessageTop;
                models.wl.collections.inhabitant
                    .update(
                        {
                            id: req.params.id
                        },
                        {
                            isActive: false
                        })
                    .then(function (inhabitant) {
                        inhabitantTop = inhabitant[0];
                        if (inhabitantTop.email === null) {
                            typeMessageTop = "sms";
                            return putToMessageQueue("sms", inhabitantTop.phoneNumber, inhabitantTop, langTop, 'inhabitant-inactivation-sms');
                        }
                        else {
                            typeMessageTop = "email";
                            return putToMessageQueue("email", inhabitantTop.email, inhabitantTop, langTop, 'inhabitant-inactivation');
                        }
                    })
                    .then(function () {
                        return res.json({data: typeMessageTop, code: 200});
                    })
                    .catch(function (err) {
                        return res.json({data: err.toString(), code: 500});
                    })
            }
            function setActiveInhabitant(req, res) {
                var inhabitantTop,
                    langTop = req.body.lang,
                    typeMessageTop;
                models.wl.collections.inhabitant
                    .update(
                        {
                            id: req.params.id
                        },
                        {
                            isActive: true
                        })
                    .then(function (inhabitant) {
                        inhabitantTop = inhabitant[0];
                        if (inhabitantTop.email === null) {
                            typeMessageTop = "sms";
                            return putToMessageQueue("sms", inhabitantTop.phoneNumber, inhabitantTop, langTop, 'inhabitant-activation-sms');
                        }
                        else {
                            typeMessageTop = "email";
                            return putToMessageQueue("email", inhabitantTop.email, inhabitantTop, langTop, 'inhabitant-activation');
                        }
                    })
                    .then(function () {
                        return res.json({data: typeMessageTop, code: 200});
                    })
                    .catch(function (err) {
                        return res.json({data: err.toString(), code: 500});
                    })
            }
            function setDeletedInhabitant(req, res) {
                var inhabitantTop,
                    langTop = req.body.lang,
                    typeMessageTop;
                models.wl.collections.inhabitant
                    .update(
                        {
                            id: req.params.id
                        },
                        {
                            isDeleted: true
                        })
                    .then(function (inhabitant) {
                        inhabitantTop = inhabitant[0];
                        return models.wl.collections.user
                            .update(
                                {
                                    id: inhabitantTop.user
                                },
                                {
                                    isDeleted: true
                                }
                            );
                    })
                    .then(function (inhabitant) {
                        if (inhabitantTop.email === null) {
                            typeMessageTop = "sms";
                            return putToMessageQueue("sms", inhabitantTop.phoneNumber, inhabitantTop, langTop, 'inhabitant-deletion-sms');
                        }
                        else {
                            typeMessageTop = "email";
                            return putToMessageQueue("email", inhabitantTop.email, inhabitantTop, langTop, 'inhabitant-deletion');
                        }
                    })
                    .then(function () {
                        return res.json({data: typeMessageTop, code: 200});
                    })
                    .catch(function (err) {
                        return res.json({data: err.toString(), code: 500});
                    })
            }
            function putToMessageQueue(messageType, recipient, inhabitant, lang, templateType) {
                return models.wl.collections.message_queue.create({
                        recipient: recipient,
                        type: messageType,
                        sendType: templateType,
                        plannedAt: moment().format(),
                        state: 'NEW',
                        lang: lang,
                        data: {
                            inhabitant: {
                                surname: inhabitant.surname,
                                name: inhabitant.name
                            }
                        }
                    });
            }
            function updateInhabitant(req, res) {
                models.wl.collections.inhabitant
                    .update({
                            id: req.params.id
                        },
                        {
                            surname: req.body.surname,
                            name: req.body.name,
                            patronymic: req.body.patronymic,
                            photo: req.body.photo,
                            phoneNumber: req.body.phoneNumber,
                            appartment: req.body.appartment,
                            building: req.body.building
                        })
                    .then(function (inhabitant) {
                        return res.json({
                            data: inhabitant, code: 200
                        });
                    })
                    .catch(function (err) {
                        return res.json({
                            data: err.toString(), code: 500
                        });
                    });
            }
        })
        .delete(function (req, res, next) {
            models.wl.collections.inhabitant
                .destroy({
                    id: req.params.id
                })
                .then(function () {
                    res.json({
                        data: "Deleted", code: 200
                    });
                })
                .catch(function (err) {
                    res.json({
                        data: err.toString(), code: 500
                    });
                })
        });

        router.route('/')
        .post(function (req, res, next) {
            models.wl.collections.inhabitant
                .create({
                    username: req.body.username,
                    password: models.wl.collections.user.hashPassword(req.body.password)
                })
                .then(function (user) {
                    res.json({
                        data: user, code: 200
                    });
                })
                .catch(function (err) {
                    res.json({
                        data: err.toString(), code: 500
                    });
                });
        })
        .get(function (req, res, next) {
            if (typeof req.query.type === 'undefined') {
               return getAll(req, res);
            }
            switch (req.query.type) {
                case "filter":
                    getFiltered(req, res);
                    break;
                case "count":
                    getCount(req, res);
                    break;
            }
            function getCount(req, res) {
                models.wl.collections.inhabitant.count({
                    isActive: false
                }).then(function (inhabitantCount) {
                    return res.json({data: inhabitantCount, code: 200});
                }).catch(function(err){
                    return res.json({data: err.toString(), code: 500});
                })
            }
            function getFiltered(req, res) {
                var findCriteria = {};
                if (typeof req.query.surname !== 'undefined' && req.query.surname !== 'null') {
                    findCriteria.surname = req.query.surname;
                    findCriteria.name = req.query.surname;
                }
                if (typeof req.query.phone !== 'undefined' && req.query.phone !== 'null') {
                    findCriteria.phoneNumber =  req.query.phone;
                }
                if (typeof req.query.building !== 'undefined' && req.query.building !== 'null') {
                    findCriteria.building = req.query.building;
                }
                models.wl.collections.inhabitant.find(findCriteria)
                    .populate("building")
                    .sort('createdAt ASC')
                    .then(function (inhabitants) {
                        return res.json({data: inhabitants, code: 200});
                    })
                    .catch(function (err) {
                        return res.json({data: err.toString(), code: 500});
                    });
            }
            function getAll(req, res) {
                models.wl.collections.inhabitant.find()
                    .populate("building")
                    .sort('createdAt ASC')
                    .then(function (inhabitants) {
                        return res.json({data: inhabitants, code: 200});
                    })
                    .catch(function (err) {
                        return res.json({data: err.toString(), code: 500});
                    });
            }
        })
};