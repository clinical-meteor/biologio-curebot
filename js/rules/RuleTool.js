const Util = require('../util/Util');

/**
 * Created by dd on 1/15/15.
 */
class RuleTool {
    applyFunction(expr, context) {
        // console.log("applyFunction: expr=", expr);
        var fn = new Function("context", expr);
        var result = fn(context);
        //console.log("applyFunction: result=", result);
        return result;
    }

    expandRawJSExpression(raw) {
        let expr = "let val = null;";
        // expr += "\nval = ( " + this.buildJSRuleExpression(rule, context) + " )";
        expr += "\nval = (";
        const tokens = raw.split(" ");
        for (let i in tokens) {
            let token = tokens[i];
            if (!token) continue;
            if (token.indexOf(".")) {
                expr += " " + RuleTool.nullSafe(token)
            } else {
                expr += " " + token;
            }
        }
        expr += ")";
        expr += "\nreturn val;";
        return expr;
    }

    buildJSExpression(rule, context) {
        let expr = "let val = null;";
        // expr += "\nval = ( " + this.buildJSRuleExpression(rule, context) + " )";
        expr += this.buildJSRuleExpression(rule, context);
        expr += "\nreturn val;";
        return expr;
    }

    buildJSRuleExpression(rule, context) {
        var expr = "";
        var agg = rule.aggregate;
        if (agg == "and") agg = "&&";
        if (agg == "or") agg = "||";
        if (agg == "sum") agg = "+";
        if (! agg) agg = "&&";
        if (rule.property) expr += "\nval = ( " + this.buildJSClauseExpression(rule, context) + " )";
        if (rule.map) expr += this.buildJSMapExpression(rule, context);
        if (rule.rules) {
            if (expr) expr += " " + agg + " ";
            expr += this.buildJSSubrulesExpression(rule)
        }
        return expr;
    }

    // buildJSRuleExpression(rule, context) {
    //     var expr = "";
    //     var agg = rule.aggregate;
    //     if (agg == "and") agg = "&&";
    //     if (agg == "or") agg = "||";
    //     if (agg == "sum") agg = "+";
    //     if (! agg) agg = "&&";
    //     if (rule.property) expr += this.buildJSClauseExpression(rule, context);
    //     if (rule.map) expr += this.buildJSMapExpression(rule, context);
    //     if (rule.rules) {
    //         if (expr) expr += " " + agg + " ";
    //         expr += this.buildJSSubrulesExpression(rule)
    //     }
    //     return expr;
    // }

    buildJSSubrulesExpression(rule) {
        var context = rule.property;
        var agg = rule.aggregate;
        if (agg == "and") agg = "&&";
        if (agg == "or") agg = "||";
        if (agg == "sum") agg = "+";
        if (! agg) agg = "&&";
    
        //loop thru each clause
        for (var ci in rule.rules) {
            //for this clause, build an expression
            var r = rule.rules[ci];
            var ruleExpression = this.buildJSRuleExpression(r, context);
            if (expr.length > 0) expr += " " + agg + " ";
            expr += "(" + ruleExpression + ")";
        }//next clause
    
        return expr;
    }

    static nullSafe(str) {
        if (str.indexOf(".") < 0) return str;
        let expr = "";
        let arr = str.split(".");
        let subexpr = "";
        for (let i in arr) {
            let item = arr[i];
            if (subexpr.length > 0) subexpr += ".";
            subexpr += item;
            if (expr.length > 0) expr += " && ";
            expr += subexpr;
        }
        return expr;
    }

    buildJSClauseExpression(rule, context) {
        //console.log("buildJSClauseExpression for ", rule);
        var expr = "";
        if (context) {
            expr += context + "[.";
        }
    
        //TODO: loop thru each subexpression


        //if (rule.negated) rule += "! ";
        expr += "(";
        expr += RuleTool.nullSafe(rule.property);
        // if (rule.property != "true") expr += "[0].answer";
        if (rule.operator) expr += " " + rule.operator + " ";
        var valueStr = "";
        if (typeof rule.values == 'undefined' || typeof rule.values == "null") {
            expr += ")";
            if (context) expr += "]";
            return expr;
        }
        if( Object.prototype.toString.call( rule.values ) === '[object Array]' ) {
    
            //values contains an array
            valueStr  += "[";
            for (var i in rule.values) {
                var value = rule.values[i];
                if (Util.isNumber(value)) {
                    //do not quote
                } else if (Util.isString(value)) {
                    value = '"' + value + '"';
                }
                //TODO support dates
                if (i > 0) valueStr += ", ";
                valueStr += value;
            }
            valueStr +=  "]";
    
        } else {
            //values contains a string or number
            if (Util.isNumber(rule.values)) {
                valueStr += rule.values;
            } else if (Util.isString(rule.values)) {
                valueStr += '"' + rule.values + '"';
            }
            //TODO support dates
        }
    
        expr += valueStr;
        expr += ")";
    
        if (context) {
            expr += "]";
        }
    
        if (rule.transform) {
            if (typeof rule.transform.true != 'undefined' && typeof rule.transform.true != "null") {
                expr += " ? " + rule.transform.true;
            }
    
            if (typeof rule.transform.false != 'undefined' && typeof rule.transform.false != "null") {
                expr += " : " + rule.transform.false;
            }
        }
        return expr;
    }


    buildJSMapExpression(rule) {
        // var expr = "var val=null;";
        let expr = "";
        for (var inputIdx in rule.inputs) {
            var varName = "x" + inputIdx;
            var valName = rule.inputs[inputIdx];
            expr += "\nlet " + varName + "=context." + valName + ";";
        }
        for (var condition in rule.map) {
            var val = rule.map[condition];
            expr += " if (" + condition + ") { val=" + val + "; }";
        }
        // expr += "\nreturn val;";
        // console.log("expr=", expr);
        return expr;
    }

}

module.exports = RuleTool;