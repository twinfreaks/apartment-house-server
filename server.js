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
    corsConfig = Config.get("cors");


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://apartment-house.herokuapp.com");
  res.header("Access-Control-Allow-Headers", "authorization, Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  next();
});
// app.use(cors());

//Scheduler jobs
require('./jobs/smsSend');
require('./jobs/emailSend');
// Socket controllers
require('./sockets')(io);
//Standard route to check if server is ok
router.get('/', function (req, res) {
    res.json({data: "Server is up"});
});
//Application controllers
require('./controllers/index')(app);
//Middleware for serving static files.
// app.use(express.static(path.join(__dirname + '/dist/index.html')));
//Application models and their initialization
var models = require('./models');
models.wl.initialize(models.config, function (err, models) {
    if (err) {
        return console.log(err);
    }
    //Seeding of initial user nad superuser and roles
    models.collections.role.seedRoles(models.collections.user);

    server.listen(port);
    console.log("app starts on port " + port);
});
app.use(function(req, res, next) {
  res.sendFile("index.html");
});

// For all GET requests, send back index.html
// so that PathLocationStrategy can be used
// app.get('/*', function(req, res) {
//   res.sendFile(path.join(__dirname + '/dist/index.html'));
// });