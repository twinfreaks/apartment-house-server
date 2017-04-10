'use strict';

var Waterline = require('waterline');

var Role = {
    identity: 'role',
    connection: 'default',

    attributes: {
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        users: {
            collection: 'user',
            via: 'roles'
        }
    },

    seedRoles: function (userModel) {

        var model = this;
        var userTop;

        this.findOrCreate([
            {
                "name": "superAdmin",
                "description": "Superadmin role"
            },
            {
                "name": "adminBlog",
                "description": "Admin blog role"
            },
            {
                "name": "adminAccountant",
                "description": "Admin accountant role"
            },
            {
                "name": "inhabitant",
                "description": "Inhabotant role"
            }
        ]).then(function (roles) {

            return userModel.find({
                username: "superadmin"
            });

        }).then(function (userFind) {
            if (userFind.length == 0) {
                return userModel.create(
                    {
                        "username": "superadmin",
                        "password": "superadmin",
                        "email": "superdmin@email.com"
                    }
                ).then(function (user) {
                    userTop = user;

                    return model.findOne({
                        name: "superAdmin"
                    });

                }).then(function (role) {
                    userTop.roles.add(role.id);
                    return userTop.save();
                }).then(function () {
                    console.log("seed done");
                });
            }
            else {
                console.log('nothing to seed');
                return true;
            }
        }).then(function () {
            return userModel.find({
                username: "user"
            });
        }).then(function (userInhabitantFind) {
            if (userInhabitantFind.length == 0) {
                return userModel.create(
                    {
                        "username": "user",
                        "password": "user",
                        "email": "user@email.com"
                    }
                ).then(function (user) {
                    userTop = user;

                    return model.findOne({
                        name: "inhabitant"
                    });

                }).then(function (role) {
                    userTop.roles.add(role.id);
                    return userTop.save();
                }).then(function () {
                    console.log("seed done");
                });
            }
            else {
                console.log('nothing to seed');
                return true;
            }
        });
    }
};


module.exports = Waterline.Collection.extend(Role);