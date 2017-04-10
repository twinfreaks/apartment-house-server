module.exports = function (io) {
    'use strict';

    io.on('connection', function (socket) {
        console.log("***** WS connection *****");

        socket.on('disconnect', function () {
            console.log('***** WS user disconnected *****');
        });
    });

    var normalizedPath = require("path").join(__dirname);
    require("fs")
        .readdirSync(normalizedPath)
        .filter(function (file) {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
        })
        .forEach(function(file) {
            var filenameRaw = file.substring(0, file.indexOf('.js')),
                socketRoute = io.of(filenameRaw);
            require("./" + file)(socketRoute);
    });
};