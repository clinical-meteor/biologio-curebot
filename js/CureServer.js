const restify = require('restify');
const builder = require('botbuilder');
const RuleBot = require('./RuleBot');
const rules = require('biolog_rules');
const ChatbotConfig = require('./config/ChatbotConfig.json');
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

        // Create chat bot
        rules.GSheetImporter.connect((err, json) => {
            self.ruler = new Ruler(json);
            this.ruleBot = new RuleBot(self.connector, self.ruler, dbConnector);
        });
    }

    stop() {
        this.server.stop();
    }
}

module.exports = CureServer;