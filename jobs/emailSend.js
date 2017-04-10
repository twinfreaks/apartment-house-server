var Config = require('config'),
    Agenda = require('agenda'),
    Promise = require('bluebird'),
    moment = require('moment'),
    nodemailer = require('nodemailer'),
    EmailTemplate = require('email-templates').EmailTemplate,
    path = require("path"),
    models = require('../models'),

    mongoConnectionString = Config.get("schedulerMongoDb"),
    agenda = new Agenda({db: {address: mongoConnectionString}});

agenda.define('send email', function (job, done) {

    console.log("******* scheduler SEND EMAIL " + new Date() + " *******");
    var fromTime = moment().startOf('day').format();
    var toTime = moment().endOf('day').format();

    models.wl.collections.message_queue.find({
        state: ["NEW", "ERROR"],
        plannedAt: {
            '<=': toTime
        },
        type: 'email'
    }).then(function (messages) {
        return Promise.each(messages, function (message) {

            var transporter = nodemailer.createTransport({
                service: Config.get("smtpService"),
                auth: {
                    user: Config.get("smtpUsername"),
                    pass: Config.get("smtpPassword")
                }
            });
            var emailTemplate = new EmailTemplate(path.join(__dirname, '../email-templates', message.sendType)),
                templateData = message.data;
            templateData.resetPswdHost = Config.get("frontendHost");

            var sendPwdReminder = transporter.templateSender({
                render: function (context, callback) {
                    emailTemplate.render(templateData, message.lang, function (err, result) {
                        if (err) return next(err);

                        callback(null, {
                            html: result.html,
                            text: result.text,
                            subject: result.subject
                        });
                    })
                }
            });

            sendPwdReminder({
                from: Config.get("smtpSender"),
                to: message.recipient
            }).then(function (info) {
                return models.wl.collections.message_queue.update(
                    {
                        id: message.id
                    },
                    {
                        sentAt: moment().format(),
                        state: "SUCCESS",
                        info: {messageId: info.messageId, messageState: info.response}
                    }
                );
                console.log('Message %s sent: %s', info.messageId, info.response);
            }).catch(function (err) {
                return models.wl.collections.message_queue.update(
                    {
                        id: message.id
                    },
                    {
                        state: "ERROR"
                    }
                );
            });

        });
    }).then(function(){
        done();
    }).catch(function(err){
        console.log(err.toString());
        done();
    });

});

agenda.on('ready', function () {
    agenda.every('0.3 minutes', 'send email');
    agenda.start();
});

agenda.on('error', function (err) {
    console.log(err.toString());
});

module.exports = agenda;