/*


*/

var moment = require('moment');
var Parser = require('../parser').Parser;
var ParsedResult = require('../../result').ParsedResult;
var util  = require('../../utils/EN');

//var PATTERN = /(\W|^)(within|in)\s*([0-9]+|an?|half(?:\s*an?)?)\s*(seconds?|minutes?|hours?|days?)\s*(?=(?:\W|$))/i;

var PATTERN = new RegExp('(\\W|^)' +
    '(within|in)\\s*' +
    '('+ util.INTEGER_WORDS_PATTERN + '|[0-9]+|an?|half(?:\\s*an?)?)\\s*' +
    '(seconds?|minutes?|hours?|days?)\\s*' +
    '(?=\\W|$)', 'i'
);


exports.Parser = function ENDeadlineFormatParser(){
    Parser.apply(this, arguments);

    this.pattern = function() { return PATTERN; }

    this.extract = function(text, ref, match, opt){

        var index = match.index + match[1].length;
        var text  = match[0];
        text  = match[0].substr(match[1].length, match[0].length - match[1].length);

        var result = new ParsedResult({
            index: index,
            text: text,
            ref: ref
        });

        var num = match[3];
        if (util.INTEGER_WORDS[num] !== undefined) {
            num = 5;
        } else if (num === 'a' || num === 'an'){
            num = 1;
        } else if (num.match(/half/)) {
            num = 0.5;
        } else {
            num = parseInt(num);
        }

        var date = moment(ref);
        if (match[4].match(/day/)) {
            date.add(num, 'd');

            result.start.assign('year', date.year());
            result.start.assign('month', date.month() + 1);
            result.start.assign('day', date.date());
            return result;
        }


        if (match[4].match(/hour/)) {

            date.add(num, 'hour');

        } else if (match[4].match(/minute/)) {

            date.add(num, 'minute');

        } else if (match[4].match(/second/)) {

            date.add(num, 'second');
        }

        result.start.imply('year', date.year());
        result.start.imply('month', date.month() + 1);
        result.start.imply('day', date.date());
        result.start.assign('hour', date.hour());
        result.start.assign('minute', date.minute());
        result.start.assign('second', date.second());
        result.tags['ENDeadlineFormatParser'] = true;
        return result;
    };
}
