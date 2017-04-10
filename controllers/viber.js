const models = require('../models'),
    http = require('https'),
    members = [],
    authToken = JSON.stringify({auth_token: '45a562f405f44f75-8c9192fcae383958-a6bcfbbc045d44a3'}),
    accInfoOptions = {
        method: "PUT",
        hostname: "chatapi.viber.com",
        path: "/pa/get_account_info",
        headers: {
            "content-type": "application/json",
            'Content-Length': Buffer.byteLength(authToken)
        }
    };

module.exports = function (router) {
    'use strict';

    router.route('/')
        .put(function (req, res) {
            var body = {
                    auth_token: '45a562f405f44f75-8c9192fcae383958-a6bcfbbc045d44a3',
                    receiver: members[0],
                    type: 'text',
                    text: req.query.text
                },
                sentMessagesOptions = {
                    method: "PUT",
                    hostname: "chatapi.viber.com",
                    path: "/pa/send_message",
                    headers: {
                        "content-type": "application/json",
                        'Content-Length': Buffer.byteLength(JSON.stringify(body))
                    }
                };
            function sendRequest() {
                var req = http.request(sentMessagesOptions, function (response) {
                    response.setEncoding('utf8');
                    response.on('data', function (chunk) {
                        console.log("body: " + chunk);
                    });
                });
                req.write(JSON.stringify(body));
                req.end();
            }
            for (var i = 0; i < members.length; i++) {
                body.receiver = members[i];
                sendRequest();
                if (i == members.length - 1) {
                    res.send('ok')
                }
            }
        })

        .get(function (req, res) {
            var req = http.request(accInfoOptions, function (response) {
                response.setEncoding('utf8');
                response.on('data', function (chunk) {
                    console.log("body: " + chunk);
                    var jchunk = JSON.parse(chunk);
                    for (var i = 0; i < jchunk.members.length; i++) {
                        if (!members.includes(jchunk.members[i].id)) {
                            members.push(jchunk.members[i].id)
                        }
                    }
                    console.log('members: ' + members);
                });
                response.on('end', function () {
                    res.send('ok');
                })
            });
            req.write(authToken);
            req.end();
        })
};