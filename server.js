var express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    path = require('path'),
    cors = require('cors'),
    _ = require('lodash'),
    router = express.Router(),
    port = process.env.PORT || 9009,
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    Config = require('config'),
    corsConfig = Config.get("cors"),
    jwt = require('express-jwt'),
    useragent = require('express-useragent');

// app.use(cors({
//       origin: corsConfig.origin.split(","),
//       credentials: corsConfig.credentials
//     }
// ));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://apartment-house.herokuapp.com");
  res.header("Access-Control-Allow-Headers", "authorization, Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  next();
});
//Serve static files from userfiles directory
app.use("/userfiles", express.static('userfiles'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Scheduler jobs
require('./jobs/smsSend');
require('./jobs/emailSend');
// Socket controllers
require('./sockets')(io);
// Get user agent and os
app.use(useragent.express());
// JWT middleware with exceptions for some routes
app.use(jwt({
  secret: Config.get("auth.jwtPrivateKey")
}).unless({
  path: [
    '/login',
    '/users',
    '/validation',
    '/buildings',
    '/upload',
    '/edit-profanity/upload',
    '/edit-profanity/download/1',
    '/edit-profanity/download/2',
    '/edit-profanity/download/3',
    '/restore-password',
    '/oauthverify',
    '/registration'
  ]
}));
//Application controllers
require('./controllers/index')(app);
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