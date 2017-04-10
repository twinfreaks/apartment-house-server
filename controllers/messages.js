var models = require('../models');

module.exports = function (router) {
    'use strict';

    router.route('/')
        .get(function (req, res) {
            if (typeof req.query.type === 'undefined' && typeof req.query.firstDate === 'undefined') {
                getLastMessages(req, res);
            }

            switch (req.query.type) {
                case "lazy":
                    getLazyMessages(req, res);
                    break;
            }
        });

    function getLazyMessages(req, res) {
        var limit = 5;
        var isEnd = false;
        models.wl.collections.chatmessage.find({
            "messageTime": {
                "<": req.query.firstDate
            }
        }).sort('messageTime DESC')
            .limit(limit)
            .populate('sender')
            .then(function (chatmesssages) {
                if (chatmesssages.length < limit) {
                    isEnd = true;
                }
                return res.json(
                    {
                        data: chatmesssages,
                        code: 200,
                        isEnd: isEnd
                    }
                );
            }).catch(function (err) {
            return res.json({data: err.toString(), code: 500});
        })
    }

    function getLastMessages(req, res) {
        var limit = 5;
        models.wl.collections.chatmessage.find({})
            .sort('messageTime DESC')
            .limit(limit)
            .populate('sender')
            .then(function (chatmesssages) {
                return res.json(
                    {
                        data: chatmesssages,
                        code: 200
                    }
                );
            }).catch(function (err) {
            return res.json({data: err.toString(), code: 500});
        })
    }
};