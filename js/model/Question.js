/**
 * Created by dd on 11/8/15.
 */

 class Question {
     constructor(obj) {
         this.id = obj.id;
         this.surveys =  obj.surveys,
         this.trigger = obj.trigger,
         this.label = obj.label;
         this.text = obj.text;
         this.explain = obj.explain;
         this.formtype = obj.formtype;
         this.choices = obj.choices;
         this.minfrequency = obj.minfrequency;
         this.priority = obj.priority;
         this.references = obj.references;
         this.measure = obj.measure;
         this.answermin = obj.answermin;
         this.answermax = obj.answermax;
         this.hint = obj.hint;
         this.regex = obj.regex;
         this.lookup = obj.lookup;
         this.setproperty = obj.setproperty;
     }
 }

 module.exports = Question;
 
// exports.newRule = function() {
//     if (!aggregate) aggregate = "and";
//     return {
//         property: property,
//         operator: operator,
//         values: values,
//         aggregate: aggregate,
//         tags: []
//     };
// };


//biolog.RuleTool.getMongoOperator = function(str) {
//    var oper = "$eq";
//    if (str == "==") {
//        oper = "$eq";
//    }
//    if (str == ">") {
//        oper = "$gt";
//    }
//    if (str == "<") {
//        oper = "$lt";
//    }
//    if (str == ">=") {
//        oper = "$gte";
//    }
//    if (str == "<=") {
//        oper = "$lte";
//    }
//    if (str == "!=") {
//        oper = "$neq";
//    }
//    if (str == "in") {
//        oper = "$in";
//    }
//    if (str == "!in") {
//        oper = "$nin";
//    }
//    if (str == "exists") {
//        oper = "$exists";
//    }
//    if (str == "!exists") {
//        oper = "$exists";
//    }
//    return oper;
//};



//biolog.RuleTool.newRule = function(property, operator, values, path, negated) {
//    return {
//        property: property,
//        operator: operator,
//        values: values,
//        path: path,
//        negated: negated
//    };
//};

//biolog.RuleTool.newExpression = function(conjunction, property, operator, values, path, negated) {
//    return {
//        property: property,
//        operator: operator,
//        values: values,
//        path: path,
//        negated: negated
//    };
//};