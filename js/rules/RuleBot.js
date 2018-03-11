const builder = require('botbuilder');
const Util = require('../util/Util');

class RuleBot {
    // static ruler;
    constructor(connector, ruler, dbCallback) {
        let self = this;
        // if (!RuleBot.ruler) ruler = ruler;
        this.bot = new builder.UniversalBot(connector);
        // this.queue = [];
        // this.bot.beginDialog('hi');

        // this.bot.dialog('hi', [
        //     (session, results) => {
        //         builder.Prompts.text(session, 'hi client');
        //     }
        // ])

        this.bot.dialog('/', [
            (session, results, next) => {
                // console.log("session.userData.biolog=", session.userData.biolog);
                // session.send('Welcome to Biolog, %s!', session.userData.biolog.name);
                session.endDialog();
                session.beginDialog('/converse');
                // this.converse(session);
            }
        ]);

        this.bot.dialog("/converse", [
            (session) => {
                
                if (!session.userData.biolog) {
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

                //TODO broadcast this message to any recipients
                if (session.userData.biolog.admin.conversingWith != "bot") return session.endConversation();

                //if we already have a queue of questions to ask, use that.  
                // Otherwise query for more questions.
                let qData = session.userData.biolog.qData;
                if (!qData || !qData.queue || qData.queue.length < 1 || !qData.queue[0].question) {
                    // console.log("No queue in memory: query the Ruler.  pt answers=", session.userData.biolog.data.answers);
                    qData = ruler.applyRules(session.userData.biolog.data);
                    // console.log("qData=", qData);
                    if (!qData || !qData.queue || qData.queue.length < 1 || !qData.queue[0].question) {
                        //no further questions your honor
                        session.send("I have no more questions.");
                        return session.endConversation();
                    }
                    session.userData.biolog.qData = qData;
                    // console.log("Applied rules, results=", qData);
                }
                let qItem = qData.queue[0];
                qData.currentQuestion = qData.questions[qItem.question];
                let question = qData.questions[qItem.question];
                // console.log("Ask this question:", question);
                
                if (question.formtype == "number") {
                    builder.Prompts.number(session, question.text);
                }
                if (question.formtype == "confirm") {
                    builder.Prompts.confirm(session, question.text);
                }
                if (question.formtype == "choice") {
                    let choicesObj = {};
                    let choices = question.choices.split(";");
                    for (let i in choices) {
                        let choice = choices[i];
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
                    }
                    qData.currentQuestion.choices = choicesObj;
                    qData.questions[qItem.question].choices = choicesObj;
                    builder.Prompts.choice(session, question.text,
                    choicesObj,
                    { listStyle: builder.ListStyle.auto,
                        maxRetries: 1,
                        retryPrompt:'Please select a number, or you can skip this question.' }
                );
                } else {
                    builder.Prompts.text(session, question.text);
                }
                
            },
            (session, results) => {
                
                //TODO broadcast this message to any recipients
                if (session.userData.biolog.admin.conversingWith != "bot") return;

                // console.log("/converse: received", results.response);
                let qData = session.userData.biolog.qData;
                if (!qData.queue || qData.queue.length < 1 || !qData.queue[0].question) {
                    session.send("I have no more questions.");
                    return session.endDialog();
                }
                //Get the question we just asked
                let qItem = qData.queue[0];
                let question = qData.questions[qItem.question];
                
                var repeatThisQuestion = false;

                // console.log("\n\n**********\nsession.userData=", JSON.stringify(session.userData, null, 2));
                // console.log("\n\n**********\nsession.conversationData=", JSON.stringify(session.conversationData, null, 2));
                // console.log("\n\n**********\nsession.message=", JSON.stringify(session.message, null, 2));
                // console.log("\n");
                //Store the answer.  TODO, parse the answer based on the question type
                if (!session.userData.biolog.data.answers[question.id]) {
                    session.userData.biolog.data.answers[question.id] = {};
                }
                let answerObj = {};
                //TODO support other question types
                
                if (question.formtype == "choice") {
                    let choices = session.userData.biolog.qData.currentQuestion.choices;
                    let selectedChoice = choices[results.response.entity];
                    //TODO throw an exceptin when we cannot find the choice object
                    if (!selectedChoice) selectedChoice = results.response.entity;
                    if (!selectedChoice) selectedChoice = results.response;
                    answerObj = {
                        text: question.text,
                        val: selectedChoice.id,
                        date: new Date()
                    };
                    session.userData.biolog.data.answers[question.id].latest = answerObj;
                    if (dbCallback) dbCallback(session, answerObj);
                } else if (question.formtype == "text") {
                    //validate?
                    var matchesOK = true;
                    if (question.regex) {
                        let regex = new RegExp(question.regex);
                        matchesOK = regex.test(results.response);
                        // console.log("Tested regexp: " + question.regex + " against string: '" + results.response + "' w/ result=" + matchesOK);
                    } 
                    // console.log("matchesOK=", matchesOK);
                    if (matchesOK) {
                        answerObj = {
                            text: question.text,
                            val: results.response,
                            date: new Date()
                        };
                        session.userData.biolog.data.answers[question.id].latest = answerObj;
                        if (dbCallback) dbCallback(session, answerObj);
                    } else {
                        session.send("I did not understand your response.  Could you try again?");
                        // session.replaceDialog("/converse", { reprompt: true });
                        repeatThisQuestion = true;
                    }
                } else {
                    answerObj = {
                        text: question.text,
                        val: results.response,
                        date: new Date()
                    };
                    session.userData.biolog.data.answers[question.id].latest = answerObj;
                    // console.log("\nStored answerObj=", answerObj);
                    if (dbCallback) dbCallback(session, answerObj);
                }

                //Remove the question from the queue
                if (!repeatThisQuestion) {
                    qData.queue.shift();
                    qData.currentQuestion = {};
                    if (qData.queue.length > 0) qData.currentQuestion = qData.questions[qData.queue[0].question];
                }
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
}


module.exports = RuleBot;