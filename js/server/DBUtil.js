
const Util = require('../util/Util');
const ChatbotConfig = require('../../config/ChatbotConfig.json');
const MongoDB = require("mongodb");
const assert = require('assert');
const chrono = require('chrono-node');


class DBUtil {
    
    static saveCommunication(session, messageInfo) {
        // return; //TODO remove this!!!!!!!!!!!

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
        let recipient = [{
            reference: ChatbotConfig.appName,
            display: ChatbotConfig.appTitle
        }];
        if (messageInfo.type == "out") {
            recipient = [{
                reference: session.message.user.id,
                display: session.message.user.name
            }];
        }
        // console.log("DBUtil.js: save communication:", communication);
        let communicationResource = {
            id: Util.randomString(24),
            resourceType: "Communication",
            identifier: [{value: Util.randomString(16)}],
            basedOn: [{
                reference: session.message.address.user.id, 
                display: session.message.address.user.name
            }],
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
                    text: session.message.address.channelId
                    // obj: session.message
                }
            ],
            subject: {
                reference: session.userData.biolog.subject.id,
                display: session.userData.biolog.subject.name
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
                //TODO support attachments
            ]
        };
    
        //TODO validate the Communication resource first
        
        //save the Communication object
        console.log("\n\nDBUtil.js: Saving communication:", communicationResource);
        let mongoClient = MongoDB.MongoClient;

        mongoClient.connect(ChatbotConfig.mongoDBUrl, function (err, db) {
            if (err) return console.error("Error connecting to DB", err);
            db.collection('Communications').insertOne(communicationResource, function(err, result) {
                // assert.equal(err, null);
                if (err) {
                    console.log("ERROR inserting communication:", err);
                    assert(false);
                    db.close();
                    return;
                }
                console.log("++++++++++++++++++ Inserted communicationResource=", JSON.stringify(communicationResource));
                

                db.close();

                console.log("messageInfo=", messageInfo);
                if (messageInfo.type != "in") return;
                console.log("store QR");

                //Next save any other resources specified by this question.
                let qData = session.userData.biolog.qData;
                let q = qData.currentQuestion;
                // if (q.setproperty) {
                //     session.userData.biolog[q.setproperty] = messageInfo.text;
                //     //TODO other data types
                // }

                // let answerInfo = DBUtil.getAnswerInfo(qData, communicationResource);
                let qr = DBUtil.createQuestionnaireResponse(q, communicationResource);

                console.log("\n\nDBUtil.js: Saving QuestionnaireResponse:", qr);

                //save the QuestionnaireResponse object
                mongoClient.connect(ChatbotConfig.mongoDBUrl, function (err, db) {
                    if (err) return console.error("Error connecting to DB", err);
                    db.collection('QuestionnaireResponses').insertOne(qr, function(err, result) {
                        // assert.equal(err, null);
                        if (err) {
                            console.log("ERROR inserting QuestionnaireResponse:", err);
                            assert(false);
                            db.close();
                            return;
                        }
                        console.log("Inserted QuestionnaireResponse=", JSON.stringify(qr));
                        db.close();
                    });
                });
            });
        });

        // console.log("mmmmmmmmmmmmmmm messageInfo=", messageInfo);

        

        // if (q.lookup) {
        //     //TODO lookup the answer, build answerInfo
        // }
        // if (q.resourcetype == "Condition") {
        //     //TODO assemble info across multiple Communications, e.g. code & bodySite & dates of a Condition
        //     let newCondition = DBUtil.createCondition(q, answerInfo);
        //     //TODO deduplicate, update or insert
        // }

    }

    static createQuestionnaireResponse(question, communicationResource) {
        let displayText = q.label? q.label:q.text;
        displayText += ": " + communicationResource.payload[0].contentString;
        let valueObj = DBUtil.getStructuredValue(question, communicationResource);
        let qr = {
            resourceType: "QuestionnaireResponse",
            id: Util.randomString(24),
            text: {
                status: "generated",
                div: displayText
            },
            questionnaire: {
                reference: question.id
            },
            status: "completed",
            subject: communicationResource.subject,
            authored: communicationResource.sent,
            source: communicationResource.sender,
            item: [valueObj]
        }

        return qr;
    }

    static getStructuredValue(question, communicationResource) {
        let str = communicationResource.payload[0].contentString;
        let obj = {
            valueString: str
        };
        if (question.formtype == "integer") {
            obj.valueInteger = parseInt(str);
        }
        if (question.formtype == "decimal") {
            obj.valueDecimal = Number.parseFloat(str);
        }
        if (question.formtype == "yesno") {
            if (str.toLowerCase().trim() == "yes" || str.toLowerCase().trim() == "y") {
                obj.valueBoolean = true;
            }
            if (str.toLowerCase().trim() == "no" || str.toLowerCase().trim() == "n") {
                obj.valueBoolean = false;
            }
        }
        if (question.formtype == "date") {
            obj.valueDate = chrono.parseDate(str);
        }

        //TODO support value plus date readings e.g. fasting AM glucose
        //TODO support attachments
        //TODO support valueCoding from lookup results
        //TODO support quantity
        //TODO support reference

        return obj;
    }

    static getAnswerInfo(qData, communicationResource) {
        let q = qData.currentQuestion;
        let answerInfo = {
            communication: communicationResource,
            resources: []
        }
        if (q.lookup) {
            
        }
        return answerInfo;
    }

    static createCondition(question, answerInfo) {
        let newCondition = {
            resourceType: "Condition",
            category: [
                {
                  coding: [
                    {
                      system: "http://hl7.org/fhir/condition-category",
                      code: "problem-list-item",
                      display: "Problem List Item"
                    }
                    // {
                    //   system: "http://snomed.info/sct",
                    //   code: "439401001",
                    //   display: "Diagnosis"
                    // }
                  ]
                }
              ],
            subject: answerInfo.communication.subject,
            code: answerInfo.code,
            bodySite: []
        };

        //TODO add bodySites
        // for (let i in answerInfo.bodySites) {
        //     let bodySite = answerInfo.bodySites[i];
        //     //TODO
        // }

        return newCondition;
    }
}

module.exports = DBUtil;