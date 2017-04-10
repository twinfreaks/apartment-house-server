var Config = require('config'),
    Agenda = require('agenda'),
    Promise = require('bluebird'),
    requestHTTP = require('request'),
    moment = require('moment'),
    parseString = require('xml2js').parseString,
    models = require('../models'),
    EmailTemplate = require('email-templates').EmailTemplate,
    path = require('path'),

    mongoConnectionString = Config.get("schedulerMongoDb"),
    agenda = new Agenda({db: {address: mongoConnectionString}});

agenda.define('send sms', function (job, done) {

    console.log("******* scheduler SEND SMS " + new Date() + " *******");
    var toTime = moment().format();

    models.wl.collections.message_queue.find({
            state: ["NEW","XMLERROR","ERRPHONES","ERRSTARTTIME","ERRENDTIME","ERRLIFETIME","ERRSPEED","ERRALFANAME","ERRTEXT","INSUFFICIENTFUNDS","ERROR"],
            plannedAt: {
                '<=': toTime
            },
            type: 'sms'
    }).then(function (messages) {
        return Promise.each(messages, function (message) {

            var mobileCodes = Config.get("mobileCodes").split(","),
                code = message.recipient.substring(0, 3);

            if (mobileCodes.indexOf(code) <= -1) {
                return new Promise(function (resolve, reject) {
                    models.wl.collections.message_queue.update(
                        {
                            id: message.id
                        },
                        {
                            sentAt: moment().format(),
                            state: "WRONG_OPERATOR"
                        }
                    ).then(function(){
                        return resolve(true);
                    }).catch(function (err) {
                        return reject(new Error(err.toString()));
                    });
                });
            }
            else {
                return new Promise(function (resolve, reject) {

                    var recipient = "38" + message.recipient,
                        alphaName = Config.get("smsAlphaName"),
                        smsTemplate = new EmailTemplate(path.join(__dirname, '../email-templates', message.sendType)),
                        replaceData = message.data;

                    replaceData.resetPswdHost = Config.get("frontendHost");

                    smsTemplate.render(replaceData, message.lang, function (err, result) {

                        var myXML = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
                        myXML += "<request>";
                        myXML += "<operation>SENDSMS</operation>";
                        myXML += '<message start_time="AUTO" end_time="AUTO" lifetime="4" rate="60" desc="Password send" source="'+alphaName+'">\n';
                        myXML += "   <body>" + result.text + "</body>";
                        myXML += "   <recipient>" + recipient + "</recipient>";
                        myXML += "</message>";
                        myXML += "</request>";

                        var options = {
                            method: "POST",
                            url: "http://sms-fly.com/api/api.php",
                            headers: {
                                "Authorization": "Basic " + new Buffer(Config.get("smsPhoneLogin") + ":" + Config.get("smsPassword")).toString('base64'),
                                "Content-Type": "text/xml",
                                "Accept": "text/xml"
                            },
                            body: myXML
                        };

                        requestHTTP(options, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                parseString(body, function (err, result) {

                                    models.wl.collections.message_queue.update(
                                        {
                                            id: message.id
                                        },
                                        {
                                            sentAt: moment().format(),
                                            state: result.message.state[0].$.code,
                                            info: {campaignId: result.message.state[0].$.campaignID}
                                        }
                                    ).then(function(){
                                        return resolve(true);
                                    }).catch(function (err) {
                                        return reject(new Error(err.toString()));
                                    });
                                });
                            }
                            else {
                                return reject(new Error(error));
                            }
                        });
                    });

                });
            }

        });
    }).then(function(){
        done();
    });
});


agenda.define('check sms', function (job, done) {

    console.log("******* scheduler CHECK SMS " + new Date() + " *******");
    models.wl.collections.message_queue.find({
        state: ["ACCEPT"],
        type: 'sms'
    }).then(function (messages) {
        return Promise.each(messages, function (message) {

            return new Promise(function (resolve, reject) {

                var campaignId = message.info.campaignId;

                var myXML = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
                myXML += "<request>";
                myXML += "<operation>GETCAMPAIGNINFO</operation>";
                myXML += '<message campaignID="'+campaignId+'" />';
                myXML += "</request>";

                var options = {
                    method: "POST",
                    url: "http://sms-fly.com/api/api.php",
                    headers: {
                        "Authorization": "Basic " + new Buffer(Config.get("smsPhoneLogin") + ":" + Config.get("smsPassword")).toString('base64'),
                        "Content-Type": "text/xml",
                        "Accept": "text/xml"
                    },
                    body: myXML
                };

                requestHTTP(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        parseString(body, function (err, result) {

                            var info = message.info;
                            info.cost = result.answer.campaign[0].$.campaignCost;

                            models.wl.collections.message_queue.update(
                                {
                                    id: message.id
                                },
                                {
                                    state: result.answer.campaign[0].$.status,
                                    info: info
                                }
                            ).then(function(){
                                return resolve(true);
                            }).catch(function (err) {
                                return reject(new Error(err.toString()));
                            });

                        });
                    }
                    else {
                        return reject(new Error(error));
                    }

                });
            });
        });
    }).then(function(){
        done();
    });
});

agenda.on('ready', function () {
    agenda.every('0.2 minutes', 'send sms');
    agenda.every('1 minutes', 'check sms');
    agenda.start();
});

agenda.on('error', function (err) {
    console.log(err.toString());
});

module.exports = agenda;