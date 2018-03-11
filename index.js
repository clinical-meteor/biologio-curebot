const CureServer = require('./js/CureServer.js');
const DBUtil = require('.js/server/DBUtil');

module.exports = CureServer;

// Setup Restify Server
var server = new CureServer(DBUtil.saveCommunication);

console.log("biologio-curebot: created new CureServer");