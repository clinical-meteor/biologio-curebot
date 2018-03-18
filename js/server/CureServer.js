const restify = require('restify');
const builder = require('botbuilder');
const Ruler = require('../rules/Ruler');
const RuleBot = require('../rules/RuleBot');
const ChatbotConfig = require('../../config/ChatbotConfig.json');
const GSheetImporter = require('../importer/GSheetImporter');


class CureServer {

    constructor(dbCallback) {

        let self = this;
        // Setup Restify Server
        self.server = restify.createServer();
        this.server.listen(process.env.port || process.env.PORT || 3978, function () {
           console.log('%s listening to %s', self.server.name, self.server.url); 
        });
        
        // console.log("appId: process.env.MICROSOFT_APP_ID", process.env.MICROSOFT_APP_ID);
        // console.log("appPassword: process.env.MICROSOFT_APP_PASSWORD", process.env.MICROSOFT_APP_PASSWORD);
        // Create chat connector for communicating with the Bot Framework Service
        // self.connector = new builder.ChatConnector({
        //     appId: process.env.MICROSOFT_APP_ID,
        //     appPassword: process.env.MICROSOFT_APP_PASSWORD
        // });

        self.connector = new builder.ChatConnector({
            appId: ChatbotConfig.appId,
            appPassword: ChatbotConfig.appPassword
        });
        
        // Listen for messages from users 
        self.server.post('/api/messages', self.connector.listen());
        
        // Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
        // let repeatBot = new builder.UniversalBot(connector, function (session) {
        //     console.log("Received message, session=", session);
        //     session.send("You said: %s", session.message.text);
        // });

        



        GSheetImporter.connect((err, info) => {
            if (err) {
              console.error("GSheetImporter connect error", err);
              return done();
            }
            // if (info) {
            //   console.log("GSheetImporter connected, info=", info);
            // }
            
            // Create chat bot
            GSheetImporter.import(info, (err, json) => {
                self.ruler = new Ruler(json);
                this.ruleBot = new RuleBot(self.connector, self.ruler, dbCallback);
            });
          });



          
    }

    stop() {
        this.server.stop();
    }
}

module.exports = CureServer;