/**
 * @see https://github.com/CatalystCode/alarm-bot-unit-testing
 */


    var builder = require('botbuilder');
    const Tester = require('./Tester');
    const RuleBot = require('../js/rules/RuleBot');
    const Ruler = require('../js/rules/Ruler');
    const dialogOnboard = require('./dialog/dialog-onboard');
    const GSheetImporter = require('../js/importer/GSheetImporter');
    const DBUtil = require('../js/server/DBUtil');
    // const rules = require('biolog_rules');

    // luisMock.setup();
    

    describe('test-dialog', () => {
      it('dialog-onboard', function (done) { 
        this.timeout(60000); 
        let self = this;
        self.connector = new builder.ConsoleConnector();
        // Create chat bot
        GSheetImporter.connect((err, info) => {
          if (err) {
            console.error("GSheetImporter connect error", err);
            return done();
          }
          // if (info) {
          //   console.log("GSheetImporter connected, info=", info);
          // }
          
          GSheetImporter.import(info, (err, json) => {

            if (err) {
              console.error("GSheetImporter import error", err);
              return done();
            }
            // if (json) {
            //   console.log("GSheetImporter imported, json=", json);
            // }

            self.ruler = new Ruler(json);
            self.ruleBot = new RuleBot(self.connector, self.ruler, DBUtil.saveCommunication);
            Tester.testBot(self.ruleBot.bot, dialogOnboard, done);
          });
        });
      });
    });


    //Our parent block
    // describe('Bot Tests', () => {
    
    //   it('help', function (done) { 
    //       var connector = new builder.ConsoleConnector();
    //       var bot = testBot.create(connector);
    
    //       common.testBot(bot, helpMessages, done);
    //   });
    
    //   it('create alarm', function (done) { 
    //       var connector = new builder.ConsoleConnector();
    
    //       var bot = testBot.create(connector);       
    //       common.testBot(bot, setAlarmMessages, done);
    //   });
    
    //   it('create alarm test func', function (done) {
    //       // Increasing timeout to enable alarms to show
    //       this.timeout(20000);
    
    //       var connector = new builder.ConsoleConnector();
    
    //       var bot = testBot.create(connector);       
    //       common.testBot(bot, setAlarmMessages2, done);
    //   });
    // });