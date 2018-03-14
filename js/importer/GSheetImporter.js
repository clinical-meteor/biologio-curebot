const GoogleSpreadsheet = require('google-spreadsheet');
const Rule = require('../model/Rule');
const Question = require('../model/Question');
const async = require('async');
const ChatbotConfig = require('../../config/ChatbotConfig.json');

class GSheetImporter {
    static connect(callback) {
        this.doc = new GoogleSpreadsheet(ChatbotConfig.spreadsheetId);
        this.sheets = [];
        let self = this;

        try {
            this.doc.getInfo(function(err, info) {
                for (let i=0; i<info.worksheets.length; i++) {
                    let sheet = info.worksheets[i];
                    self.sheets.push(sheet);
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
            if (sheet.title.toLowerCase().indexOf("question") >= 0) {
                GSheetImporter.importQuestions(sheet, (err, aJson) => {
                    json.questions = Object.assign({}, json.questions, aJson.questions);
                    json.rules = Object.assign({}, json.rules, aJson.rules);
                    return qCallback();
                });
            } else {
                return qCallback();
            }
        }, sheetInfo.worksheets.length);

        q.drain = () => {
            return importCallback(null, json);
        }

        try {
            for (let sheetI = 0; sheetI < sheetInfo.worksheets.length; sheetI++){
                let aSheet = sheetInfo.worksheets[sheetI];
                if (aSheet.title.indexOf("_") === 0) {
                    continue;
                }

                if (aSheet.title.toLowerCase().indexOf("legacy") >= 0) {
                    continue;
                }

                q.push(aSheet);             
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
            for (let rowI=0; rowI < rows.length; rowI++) {
                let row = rows[rowI];
                let question = new Question(rows[rowI]);
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
                json.rules[triggerRule.id] = triggerRule;
            }
            importQuestionsCallback(null, json);
        });
    }
}

module.exports = GSheetImporter;