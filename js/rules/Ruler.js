const RuleTool = require("./RuleTool");
const GSheetImporter = require("../importer/GSheetImporter");

class Ruler {
    constructor(obj) {
        if (obj) this.init(obj);
        
        // this.data = new Object();
    }

    init(obj) {
        this.questions = obj.questions
        this.rules = obj.rules;
        this.ruleTool = new RuleTool();
        this.functions = {};
        this.addFunctions(obj.rules);
    }

    initFromGSheet(callback) {
        let self = this;
        GSheetImporter.import(info, (err, json) => {
            self.init(json);
            callback(self);
        });
    }

    addFunctions() {
        for (let ri in this.rules) {
            let rule = this.rules[ri];
            // this.rules.push(rule);
            // let expr = this.ruleTool.buildJSRuleExpression(rule);
            let expr = null;
            if (rule.expression) {
                expr = this.ruleTool.expandRawJSExpression(rule.expression);
            } else {
                expr = this.ruleTool.buildJSExpression(rule);
            }
                
            
            // console.log("Rule=", rule);
            // console.log("... its Expr=" + expr);
            let fn = new Function("pt", expr);
            this.functions[rule.id] = fn;
        }

        // console.log("Added rules.  this.rules=", this.rules);
    }

    // getContextData(context) {
        // if (! context.hasOwnProperty("id")) return;
        // if (! context.id) return;
        // if (! this.data.hasOwnProperty(context.id)) {
        //     this.data[context.id] = { answers: {} };
        // }
        // return this.data[context.id];
    // }

    static alreadyAsked(context, rule, question) {
        if (rule && rule.then_ask && context) {
            // if (this.getContextData(context).answers[rule.then_ask]) return true;
            if (context.avoid && context.avoid.indexOf(rule.then_ask) > -1) return true;
            if (context.answers && context.answers[rule.then_ask]) {
                let latestAnswer = context.answers[rule.then_ask].latest;
                if (latestAnswer) {
                    let earliestReaskDate = new Date(latestAnswer.date);
                    earliestReaskDate.setDate(earliestReaskDate.getDate() + question.minfrequency); 
                    if (earliestReaskDate > new Date()) return true;
                }
            }
        }
        return false;
    }

    applyRules(context) {
        // console.log("\n\nAAAAAAAAA Apply rules to:", JSON.stringify(context, null, 2));
        let data = {
            results: [],
            questions: {},
            queue: []
        };
        for (let ri in this.rules) {
            let rule = this.rules[ri];
            let question = this.questions[rule.then_ask];
            if (Ruler.alreadyAsked(context, rule, question)) continue;

            let fn = this.functions[ri];
            // console.log("\n...Apply rule:" , JSON.stringify(rule, null, 2));
            // console.log("...= fn:" , fn);
            try {
                let result = fn(context);
                if (result==null || result===false) continue;
                
                data.results.push({
                    rule: rule,
                    result: result
                });
                data.queue.push({
                    question: question.id,
                    priority: question.priority
                });
                if (question) data.questions[question.id] = question;
            } catch (err) {
                //unable to eval.  continue
                console.log("Unable to eval fn", fn);
                console.error("...with error", err);
            }
        }

        //sort the queue by priority
        data.queue.sort((a,b) => {
            if (a.priority < b.priority)
              return -1;
            if (a.priority > b.priority)
              return 1;
            return 0;
          });
        return data;
    }
};

module.exports = Ruler;