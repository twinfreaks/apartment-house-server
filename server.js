var express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    path = require('path'),
    cors = require('cors'),
    _ = require('lodash'),
    router = express.Router(),
    port = process.env.PORT || 9009,
    server = require('http').createServer(app),
    io = require('socket.io')(server);
    Config = require('config'),
    corsConfig = Config.get("cors"),
    jwt = require('express-jwt');

//Serve static files from userfiles directory
app.use("/userfiles", express.static('userfiles'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// app.use(cors({
//         origin: corsConfig.origin.split(","),
//         credentials: corsConfig.credentials
//     }
// ));
app.use(cors());

//Scheduler jobs
require('./jobs/smsSend');
require('./jobs/emailSend');
// Socket controllers
require('./sockets')(io);
//Application controllers
require('./controllers/index')(app);
//JWT middleware with exceptions for some routes
app.use(jwt({
    secret: Config.get("auth.jwtPrivateKey")
}).unless({
        path: [
            '/login',
            '/users',
            '/validation',
            '/buildings',
            '/upload',
            '/restore-password',
            '/oauthverify'
        ]
    }));
//Application models and their initialization
var models = require('./models');
models.wl.initialize(models.config, function (err, models) {
    if (err) {
        return console.log(err);
    }
    //Seeding of initial user nad superuser and roles
    models.collections.role.seedRoles(models.collections.user);
    //Server listen to port
    server.listen(port);
    console.log("app starts on port " + port);
});