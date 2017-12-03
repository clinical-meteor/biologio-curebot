const CureServer = require('./js/server/CureServer.js');
module.exports = CureServer;

// Setup Restify Server
var server = new CureServer((session, postObject) => {
    console.log("index.js: save postObject:", postObject);
});

console.log("biologio-curebot: created new CureServer");