const GoogleSpreadsheet = require('google-spreadsheet');
const Rule = require('../model/Rule');
const Question = require('../model/Question');
const async = require('async');

class GSheetImporter {
    static connect(callback) {
        // this.doc = new GoogleSpreadsheet('1oZA7Gu82qR_MTJ1bNXLPzPoCxD_YaCe9OtVkS4WfH00');
        this.doc = new GoogleSpreadsheet('1mZekV8huG06nUclz68GyeEHLZR3AdDK12k36cT0G2p4');
        this.sheets = [];
        let self = this;

        try {
            this.doc.getInfo(function(err, info) {
                // console.log('Loaded doc: ', info);
                for (let i=0; i<info.worksheets.length; i++) {
                    let sheet = info.worksheets[i];
                    self.sheets.push(sheet);
                    // console.log('sheet ' + i+1, sheet);
                    return callback(null, info);
                }
            });
        } catch(err) {
            return callback(err);
        }
    }

    /**
     * Import objects from the spreadsheet
     * @param {*} sheetInfo 
     * @param {*} callback 
     */
    static import(sheetInfo, importCallback) {
        let json = {
            questions: {},
            rules: {}
        };

        const q = async.queue(function(sheet, qCallback) {
            // console.log("async.queue: ", sheet.title);
            if (sheet.title.toLowerCase().indexOf("question") >= 0) {
                // console.log("Import Questions from " + sheet.title);
                GSheetImporter.importQuestions(sheet, (err, aJson) => {
                    // console.log("Import this json:", aJson);
                    json.questions = Object.assign({}, json.questions, aJson.questions);
                    // console.log("allQs=", allQs);
                    json.rules = Object.assign({}, json.rules, aJson.rules);
                    return qCallback();
                });
            } else {
                // console.log("Do NOT Import from " + sheet.title);
                return qCallback();
            }
            // callback();
        }, sheetInfo.worksheets.length);

        q.drain = () => {
            // console.log("Completed import.  Return json=", json);
            return importCallback(null, json);
        }

        try {
            for (let sheetI = 0; sheetI < sheetInfo.worksheets.length; sheetI++){
                let aSheet = sheetInfo.worksheets[sheetI];
                // console.log("Import sheet", aSheet.title);
                if (aSheet.title.indexOf("_") === 0) {
                    continue;
                }

                if (aSheet.title.toLowerCase().indexOf("legacy") >= 0) {
                    continue;
                }

                q.push(aSheet);
                // , (err) => {
                //     if (err) {
                //         console.error("Error importing sheet", err);
                //         return callback(err);
                //     }
                //     console.log('importing sheet ' + theSheet.title + '; json=', json);

                //     // console.log("Import sheet: " + sheet.title); 
                // });                
            }
            
        } catch(err) {
            return importCallback(err);
        }
    }

    static importQuestions(sheet, importQuestionsCallback) {
        let json = {
            questions: {},
            rules: {}
        };

        sheet.getRows({
            offset: 1,
        }, function( err, rows ) {
            // console.log('Import '+rows.length+' questions', rows[0]);
            for (let rowI=0; rowI < rows.length; rowI++) {
                let row = rows[rowI];
                let question = new Question(rows[rowI]);
                // console.log("Created question object:", question);
                json.questions[question.id] = question;
                let triggerRule = null;
                if (!question.trigger) {
                    question.trigger = "false";
                }
                triggerRule = new Rule({
                    id: "trigger_" + question.id,
                    expression: question.trigger,
                    then_ask: question.id,
                });
               
                // triggerRule.setSimpleExpression(question.trigger);
                // triggerRule.then_ask = question.id;
                // console.log("Created trigger rule", triggerRule);
                json.rules[triggerRule.id] = triggerRule;
                // }
            }
            importQuestionsCallback(null, json);
        });
    }
}

module.exports = GSheetImporter;