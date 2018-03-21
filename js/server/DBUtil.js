
const Util = require('../util/Util');
const ChatbotConfig = require('../../config/ChatbotConfig.json');
const MongoDB = require("mongodb");
const assert = require('assert');

class DBUtil {
    
    static saveCommunication(session, messageInfo) {
        if (messageInfo.received) {
            messageInfo.sent = new Date().toISOString();
            // messageInfo.received = new Date(messageInfo.received).toISOString();
        }
        if (messageInfo.sent) {
            messageInfo.received = new Date().toISOString();
            // messageInfo.sent = new Date(messageInfo.sent).toISOString();
        }
        let sender = {
            reference: ChatbotConfig.appName
        };
        if (messageInfo.type == "in") {
            sender = {
                reference: session.message.user.id,
                display: session.message.user.name
            };
        }
        let recipient = {
            reference: ChatbotConfig.appName
        };
        if (messageInfo.type == "out") {
            recipient = [{
                reference: session.message.user.id,
                display: session.message.user.name
            }];
        }
        // console.log("DBUtil.js: save communication:", communication);
        let communicationResource = {
            _id: Util.randomString(24),
            resourceType: "Communication",
            identifier: [{value: Util.randomString(16)}],
            // basedOn: [{reference: ""}],
            partOf: [{reference: session.message.address.conversation.id}],
            status: "completed",
            medium: [
                {
                // coding: [
                //     {
                //     system: "http://hl7.org/fhir/v3/ParticipationMode",
                //     code: "ELECTRONIC",
                //     display: "electronic"
                //     }
                // ],
                text: session.message.channelId
                }
            ],
            subject: {
                reference: session.userData.biolog.subject.id
            },
            recipient: recipient,
            context: {
                reference: session.userData.biolog.qData.currentQuestion.id,
                display: session.userData.biolog.qData.currentQuestion.text,
            },
            sent: messageInfo.sent,
            received: messageInfo.received,
            sender: sender,
            payload: [
                { contentString: messageInfo.text }
            ]
        };
    
        //TODO validate the Communication resource first
        
        //save the Communication object
        console.log("\n\nDBUtil.js: Saving communication:", communicationResource);
        let mongoClient = MongoDB.MongoClient;
        mongoClient.connect(ChatbotConfig.mongoDBUrl, function (err, db) {
            if (err) return console.error("Error connecting to DB", err);
            db.collection('communications_test1').insertOne(communicationResource, function(err, result) {
                // assert.equal(err, null);
                if (err) {
                    console.log("ERROR inserting communication:", err);
                    assert(false);
                    db.close();
                    return;
                }
                console.log("Inserted communicationResource=", JSON.stringify(communicationResource));
                db.close();
            });
        });
    }

    
}

module.exports = DBUtil;