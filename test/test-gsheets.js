
const GSheetImporter = require("../js/importer/GSheetImporter");
const RuleTool = require("../js/rules/RuleTool");
const Ruler = require("../js/rules/Ruler");
const nutritionData = require('./data/nutritionData');
const patientData = require('./data/patientData');

var assert = require('assert');

describe('Biolog.rules Test GSheetImporter 1', function() {
  describe('test connect to Google Spreadsheet', function() {
    it('should retrieve some questions and rules', function(done) {
        GSheetImporter.connect((err, info) => {
            assert(!err);
            assert(info.worksheets.length > 0);
            GSheetImporter.import(info, (err, json) => {
                // console.log("Imported this json", json);
                assert(Object.keys(json.questions).length > 0);
                assert(Object.keys(json.rules).length > 0);

                // var rulesArray = Object.keys(json.rules).map(function (key) { return json.rules[key]; });

                let ruler = new Ruler(json);
                // ruler.addRules(json.rules);

                let pt = {
                    id: "Random_Patient",
                    answers: {},
                    flags: {}
                };
                
                let data = ruler.applyRules(pt);
                console.log("Results 1=", data);
                assert(data.results.length===1);
                assert(data.results[0].result===true);
                assert(data.results[0].rule.then_ask=="your_goal");

                //retrieve the next question
                let nextQuestion = data.questions[data.results[0].rule.then_ask];
                let nextQuestionQueue = data.queue[0].question;
                console.log("First ask this question", nextQuestionQueue);
                assert(nextQuestion.id == "your_goal");
                assert(nextQuestionQueue == "your_goal");

                //assume the user has answered: cure_my_diabetes
                pt.answers.your_goal = {
                    latest: {
                        val: "cure_my_disease",
                        date: new Date()
                    }
                };
                // pt.avoid = [nextQuestion.id];

                //reapply rules
                data = ruler.applyRules(pt);
                results = data.results;
                console.log("Results 2=", data);
                assert(results.length===1);
                assert(results[0].result);
                // assert(results[0].rule.then_ask=="cure_what");

                //retrieve the next question
                nextQuestion = json.questions[results[0].rule.then_ask];
                console.log("Next ask this question", nextQuestion);
                // assert(nextQuestion.id == "cure_what");
                done();
            });
        });
        
        // importer.getRows(0);
    });
  });
});


