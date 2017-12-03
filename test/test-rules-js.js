
// const Rule = require("../js/model/Rule");
const RuleTool = require("../js/rules/RuleTool");
const Ruler = require("../js/rules/Ruler");
const nutritionData = require('./data/nutritionData');
const patientData = require('./data/patientData');

var assert = require('assert');

// describe('Biolog.rules Test RuleTool 1', function() {
//   describe('test 1 nutrition rule', function() {
//     it('should return the right mortality rate for each x value', function() {
//         let ruleTool = new RuleTool();
//         var rule = nutritionData.dietRules[1];
//         var expr = ruleTool.buildJSExpression(rule);
//         // console.log("Test condition rule has expression: " + expr);
//         assert.ok(ruleTool.applyFunction(expr, {data: {diet_dailyIntake: {fruit: {normVal: 0} } } }) === 1);
//         assert.ok(ruleTool.applyFunction(expr, {data: {diet_dailyIntake: {fruit: {normVal: 1} } }}) === 0.9);
//         assert.ok(ruleTool.applyFunction(expr, {data: {diet_dailyIntake: {fruit: {normVal: 1.99999} } }}) === 0.9);
//         assert.ok(ruleTool.applyFunction(expr, {data: {diet_dailyIntake: {fruit: {normVal: 2} } }}) === 0.825);
//         assert.ok(ruleTool.applyFunction(expr, {data: {diet_dailyIntake: {fruit: {normVal: 6.77777} } }}) === 0.795);
//         assert.ok(ruleTool.applyFunction(expr, {data: {diet_dailyIntake: {fruit: {normVal: 999999} } }}) === 0.795);
//     });
//   });
// });


// describe('Biolog.rules Test Ruler 1', function() {
//     describe('test Ruler applies rule to patient object', function() {
//         it('should return the right mortality rate for a patient object', function() {
//             let ruler = new Ruler();
//             ruler.addRules(nutritionData.dietRules);
//             let results = ruler.applyRules(patientData);
//             // console.log("Test all nutrition rules has patientData: ", patientData);
//             assert.ok(results[0].result === 0.81);
//         });
//     });
// });