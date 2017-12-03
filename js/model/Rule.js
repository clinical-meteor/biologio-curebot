/**
 * Created by dd on 11/8/15.
 */

 const Util = require('../util/Util');

class Rule {
    constructor(obj) {
        if (!obj) {
            this.id = Util.randomString(16);
            return;
        }
        this.id = obj.id;
        if (!obj.id) this.id = Util.randomString(16);
        this.name = obj.name;
        this.description = obj.description;
        this.property = obj.property;
        this.operator = obj.operator;
        // this.value = obj.value;
        this.values = obj.values;
        this.aggregate = obj.aggregate;
        this.map = obj.map;
        this.then_ask = obj.then_ask;
        this.set_property = obj.set_property;
        
        this.tags = obj.tags;
        this.expression = obj.expression;
    }

    setSimpleExpression(expression) {
        
        this.property = expression.trim();
        if (!expression) return;
        // if (!this.property) this.property = "true";
        // this.operator = "eq";
        // this.value = "true";
        // if (!expression) return;

        let eqI = expression.indexOf("==");
        if (eqI > 0) {
            this.property = expression.substring(0, eqI).trim();
            this.operator = "==";
            this.values = expression.substring(eqI + 2).trim();
            return;
        }

        let neqI = expression.indexOf("!=");
        if (neqI > 0) {
            this.property = expression.substring(0, neqI).trim();
            this.operator = "!=";
            this.values = expression.substring(neqI + 2).trim();
            return;
        }

        let gteI = expression.indexOf(">=");
        if (gteI > 0) {
            this.property = expression.substring(0, gteI).trim();
            this.operator = ">=";
            this.values = expression.substring(gteI + 2).trim();
            return;
        }

        let lteI = expression.indexOf("<=");
        if (lteI > 0) {
            this.property = expression.substring(0, lteI).trim();
            this.operator = "<=";
            this.values = expression.substring(lteI + 2).trim();
            return;
        }

        let gtI = expression.indexOf(">");
        if (gtI > 0) {
            this.property = expression.substring(0, gtI).trim();
            this.operator = ">";
            this.values = expression.substring(gtI + 1).trim();
            return;
        }

        let ltI = expression.indexOf("<");
        if (ltI > 0) {
            this.property = expression.substring(0, ltI).trim();
            this.operator = "<";
            this.values = expression.substring(ltI + 1).trim();
            return;
        }
    }
}

 module.exports = Rule;
 
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