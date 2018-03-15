
const Util = require('../util/Util');
const ChatbotConfig = require('../../config/ChatbotConfig.json');
const MongoDB = require("mongodb");
const assert = require('assert');

class DBUtil {
    
    static saveCommunication(session, communication) {
        // console.log("DBUtil.js: save communication:", communication);
        let communicationResource = {
            resourceType: "Communication",
            identifier: [{value: Util.randomString(16)}],
            basedOn: [{reference: ""}],
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
            recipient: [
                {
                    reference: session.message.user.id,
                    display: session.message.user.name
                }
            ],
            context: {
                reference: session.userData.biolog.qData.currentQuestion.id,
                display: session.userData.biolog.qData.currentQuestion.text,
            },
            sent: session.message.timestamp,
            received: new Date().toISOString(),
            sender: {
                reference: ChatbotConfig.appName
            },
            payload: [
                { contentString: session.message.text }
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