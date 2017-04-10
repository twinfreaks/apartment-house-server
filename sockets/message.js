var models = require("../models"),
    moment = require('moment');

module.exports = function (io) {
    'use strict';

    io.on('connection', function (socket) {
        console.log("***** WS messages connected *****");

        socket.on("disconnect", function () {
            console.log("client disconnected messages");
        });

        socket.on("create", function (message) {
            models.wl.collections.chatmessage.create({
                "messageBody": message.message,
                "messageTime": moment().format(),
                "messageReaded": false,
                "sender": message.sender
            }).then(function (message) {
                return models.wl.collections.chatmessage.findOne({
                    id: message.id
                })
                    .populate('sender')
                    .then(function (message) {
                        io.emit("create", message);
                    });
            });

        });


        socket.on('readed', function (inhabitant) {
            models.wl.collections.chatmessage.update(
                {
                    messageReaded: false,
                    sender: {
                        "!": inhabitant
                    },
                    or: [
                        {recipient: inhabitant},
                        {recipient: null}
                    ]
                },
                {
                    messageReaded: true
                }
            ).then(function (messageUpd) {
                io.emit("update", messageUpd);
            })
        });
    });
};