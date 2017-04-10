var fs = require('fs');
var path = require("path");
var Config = require('config');

var postgresqlAdapter = require('sails-postgresql');
var Waterline = require('waterline');

var waterline = new Waterline();


var config = {
    adapters: {
        postgresql: postgresqlAdapter
    },

    connections: {
        default: {
            adapter: 'postgresql',
            host: Config.get('db.host'),
            port: Config.get('db.port'),
            database: Config.get('db.name'),
            user: Config.get('db.user'),
            password: Config.get('db.password'),
            ssl: Config.get('db.ssl'),
            poolSize: Config.get('db.poolSize'),
            schema: true
        }
    },
    defaults: {
        migrate: Config.get('db.migrationStrategy')
    }
};

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function (file) {
        var model = require(path.join(__dirname, file));
        waterline.loadCollection(model);
    });


module.exports = {wl: waterline, config: config};