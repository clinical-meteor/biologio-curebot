const builder = require('botbuilder');
const Util = require('../util/Util');
const ChatbotConfig = require('../../config/ChatbotConfig.json');
var azure = require('botbuilder-azure'); 

class RuleBot {
    // static ruler;
    
    constructor(connector, ruler, dbCallback, settings) {
        this.settings = settings;
        var docDbClient = new azure.DocumentDbClient(ChatbotConfig.documentDbOptions);
        var cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);

        let self = this;
        // if (!RuleBot.ruler) ruler = ruler;
        this.bot = new builder.UniversalBot(connector).set('storage', cosmosStorage);
        // this.queue = [];
        // this.bot.beginDialog('hi');

        // this.bot.dialog('hi', [
        //     (session, results) => {
        //         builder.Prompts.text(session, 'hi client');
        //     }
        // ])

        this.bot.dialog('/', [
            (session, results, next) => {
                session.endDialog();
                session.beginDialog('/converse');
            }
        ]);

        this.bot.dialog("/converse", [
            (session, results, next) => {
                console.log("\n\n111111111111111111111 this.settings=", this.settings);

                
                if (session && session.message && session.message.text == "hi bot") session.userData.biolog = {};
                if (!session.userData.biolog || !session.userData.biolog.admin) {
                    this.restartConversation(session);
                }
                if (this.settings.refresh) {
                    this.settings.refresh = false;
                    this.restartConversation(session);
                }

                //TODO broadcast this message to any recipients
                if (session.userData.biolog.admin.conversingWith != "bot") return session.endConversation();
                
                let qData = session.userData.biolog.qData;
                if (!qData || !qData.queue || qData.queue.length < 1 || !qData.queue[0].question) {
                    // console.log("No queue in memory: query the Ruler.  pt answers=", session.userData.biolog.data.answers);
                    qData = ruler.applyRules(session.userData.biolog.data);
                    console.log("\n\n AAAAAAAAAAAAAAAAAA Applied rules. qData=", qData);
                    if (!qData || !qData.queue || qData.queue.length < 1 || !qData.queue[0].question) {
                        return next();
                    }
                    session.userData.biolog.qData = qData;
                    // console.log("Applied rules, results=", qData);
                }
                let qItem = qData.queue[0];
                qData.currentQuestion = qData.questions[qItem.question];
                let question = qData.questions[qItem.question];
                
                let qObj = {
                    type: "out",
                    text: question.text,
                    sent: new Date().toISOString()
                };

                if (question.formtype == "number" || question.formtype == "integer") {
                    if (dbCallback) dbCallback(session, qObj);
                    builder.Prompts.number(session, question.text);
                }
                if (question.formtype == "confirm") {
                    if (dbCallback) dbCallback(session, qObj);
                    builder.Prompts.confirm(session, question.text);
                }
                if (question.formtype == "choice") {
                    let choicesStr = question.choices + '';
                    let choicesObj = {};
                    let choices = choicesStr.split(";");
                    let choicesSuffix = "(";
                    for (let i in choices) {
                        if (i > 0) choicesSuffix += ", ";
                        if (i+1 >= choices.length) choicesSuffix += "or ";
                        let choiceNum = Number(i) + 1;
                        choicesSuffix += choiceNum + ". ";
                        let choice = choices[i] + '';
                        let aChoiceObj = {};
                        if (choice.indexOf("=") > 0) { 
                            let choiceId = choice.substring(0, choice.indexOf("=")).trim();
                            choiceId = Util.safify(choiceId);
                            let choiceDisplay = choice.substring(choice.indexOf("=") + 1).trim();
                            aChoiceObj = {
                                id: choiceId,
                                display: choiceDisplay
                            };
                        } else {
                            aChoiceObj = {
                                id: Util.safify(choice),
                                display: choice
                            };
                        }
                        choicesObj[aChoiceObj.display] = aChoiceObj; 
                        choicesSuffix += aChoiceObj.display;
                    }
                    choicesSuffix += ")";
                    qData.currentQuestion.choicesArray = choicesObj;
                    qData.questions[qItem.question].choicesArray = choicesObj;

                    // console.log("choicesObj=" , choicesObj);
                    qObj.text = question.text + " " + choicesSuffix;
                    //TODO make it skippable
                    if (dbCallback) dbCallback(session, qObj);
                    builder.Prompts.choice(session, question.text,
                        choicesObj,
                        { listStyle: builder.ListStyle.auto,
                            maxRetries: 1,
                            retryPrompt:'Please select a number.' }
                    );
                } else {
                    if (question && question.text) {
                        if (dbCallback) dbCallback(session, qObj);
                        builder.Prompts.text(session, question.text);
                    }
                }
                
            },
            (session, results, next) => {
                
                console.log("\n\n2222222222222222222222222 session.userData.biolog.data=", JSON.stringify(session.userData.biolog.data));
                // console.log("/converse: received", results.response);
                let qData = session.userData.biolog.qData;

                let refresh = (session && session.message && session.message.text == "hi bot");
                if (refresh || this.settings.refresh) {
                    this.settings.refresh = false;
                    this.restartConversation(session);
                    return session.replaceDialog("/converse", { reprompt: true });
                }

                

                if (!qData || !qData.queue || qData.queue.length < 1 || !qData.queue[0].question) {
                    //no further questions your honor
                    session.send("I have no more questions.");
                    // return setTimeout(function() { next() }, 2000);
                    // return session.endConversation();
                    // return next();
                    return setTimeout(function() { session.endConversation() }, 2000);
                }

                let qItem = qData.queue[0];
                let question = qData.questions[qItem.question];
                
                var repeatThisQuestion = false;

                // console.log("\nQQQQQ Question=", question);
                // console.log("\n\n**********\nsession.userData=", JSON.stringify(session.userData, null, 2));
                // console.log("\n\n**********\nsession.conversationData=", JSON.stringify(session.conversationData, null, 2));
                // console.log("\n\n**********\nsession.message=", JSON.stringify(session.message, null, 2));
                // console.log("\n");
                //Store the answer.  TODO, parse the answer based on the question type
                if (!session.userData.biolog.data.answers[question.id]) {
                    session.userData.biolog.data.answers[question.id] = {};
                }
                let reply = session.message.text + '';
                let answerObj = {
                    text: reply,
                    date: new Date()
                };
                let commObj = {
                    type: "in",
                    text: reply,
                    received: new Date().toISOString()
                };
                //TODO support other question types
                
                if (question.formtype == "choice") {
                    let choices = session.userData.biolog.qData.currentQuestion.choicesArray;
                    
                    if (results.response && results.response.entity) reply = results.response.entity;
                    if (reply) {
                        let selectedChoice = choices[reply];
                        if (selectedChoice) {
                            answerObj.val = selectedChoice.id;
                            session.userData.biolog.data.answers[question.id].latest = answerObj;
                            if (dbCallback) dbCallback(session, commObj);
                        } else {
                            repeatThisQuestion = true;
                        }
                    }
                    
                } else if (question.formtype == "text") {
                    //validate?
                    let reply = session.message.text;
                    if (results.response) reply = results.response;

                    var matchesOK = true;
                    if (question.regex) {
                        let regex = new RegExp(question.regex);
                        matchesOK = regex.test(reply);
                    } 
                    if (matchesOK) {
                        answerObj.val = results.response;
                        session.userData.biolog.data.answers[question.id].latest = answerObj;
                        if (dbCallback) dbCallback(session, commObj);
                    } else {
                        session.send("I did not understand your response.  Could you try again?");
                        // session.replaceDialog("/converse", { reprompt: true });
                        repeatThisQuestion = true;
                    }
                } else {
                    let reply = session.message.text;
                    if (results.response) reply = results.response;
                    answerObj.val = reply;
                    // console.log("OTHER formtype.  Insert answerObj=", answerObj);
                    session.userData.biolog.data.answers[question.id].latest = answerObj;
                    if (dbCallback) dbCallback(session, commObj);
                }

                //Remove the question from the queue
                if (!repeatThisQuestion) {
                    qData.queue.shift();
                    // console.log("\n\nSSSSSSSSSSSShifted to next question.  qData.queue=", qData.queue);
                    qData.currentQuestion = {};
                    if (qData.queue.length > 0) qData.currentQuestion = qData.questions[qData.queue[0].question];
                }

                //TODO broadcast this message to any recipients
                if (session.userData.biolog.admin.conversingWith != "bot") return session.endDialog();

                // if (!qData.queue || qData.queue.length < 1 || !qData.queue[0].question) {
                //     session.send("I have no more questions.");
                //     return session.endDialog();
                // }

                //loop back and do next item in queue
                session.replaceDialog("/converse", { reprompt: true });
            }
        ]);

    }

    /**
     * 
     * @param {} type = bot or human
     */
    conversingWith(session, type) {
        session.userData.biolog.admin.conversingWith = type;
    }

    restartConversation(session) {
        // console.log("\n\nRRRRRRRRRRRRRRR restartConversation");
        session.userData.biolog = {
            admin: {
                botPaused: false
            },
            data: {
                answers: {}
            },
            subject: {
                id: session.message.user.id,
                name: session.message.user.name
            },
            admin: {
                conversingWith: "bot"
            },
            qData: {
                currentQuestion: {},
                queue: []
            }
        };
    }
}


module.exports = RuleBot;