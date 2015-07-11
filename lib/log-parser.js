/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
var path = require('path');
var fs = require('fs');
var clc = require('cli-color');
var ansiRE = require('ansi-regex')();

// Output styling
var TAG_LENGTH = 4;
var STYLE_NONE = function (x) {return x};
var STYLE_STRIP = clc.strip;
var STYLE_TITLE = clc.bold.inverse;
var STYLE_DATE = clc.magenta.bold.underline;
var STYLE_INFO = clc.green;
var STYLE_WARN = clc.yellow;
var STYLE_ERRR = clc.red;

/**
 * @option all		-	If true, displays the file name at the top of output.
 *						(only applies to readFile)
 *
 * @option boring	-	If true, strips all ANSI escape codes from the output.
 * 						(parseFile and parseEntry are always boring)
 *
 * @option width	-	The number of character columns to wrap the output
 * 						within. This option does not apply if 'flat' is true.
 * 						Defaults to the terminal width if found, otherwise 80.
 * 						(not applicable to parseFile or parseEntry)
 *
 * @option flat		-	If true, does not wrap and indent lines that overflow
 * 						the terminal width.
 * 						(not applicable to parseFile or parseEntry)
 *
 */

var LogParser = module.exports = function LogParser(options) {
	if (typeof options !== 'object') {options = {};}
	var indentLength = ~~calcDefaultIndentLength() || 20;
	this.__all = !!options.all;
	this.__boring = !!options.boring;
	this.__flat = !!options.flat;
	this.__formatFunction = options.flat ? formatFlatEntry : formatEntry;
	this.__width = Math.max(~~options.width || ~~process.stdout.columns || 80, indentLength + 1);
	this.__context = newContext(this.__width, indentLength);
};
LogParser.prototype = {
	readFile: function (filename) {
		var title = '';
		if (this.__all) {title = makeSeperator(path.basename(filename), this.__width);}
		
		var entries = ('' + fs.readFileSync(filename)).split('\uffff').slice(1);
		var result = title + entries.map(this.__formatFunction, this.__context).join('');
		this.__context.previousDay = new Date(0);
		return this.__boring ? STYLE_STRIP(result) : result;
	},
	readEntry: function (entryText) {
		var result = this.__formatFunction.call(this.__context, ('' + entryText).replace('\uffff', ''));
		this.__context.previousDay = new Date(0);
		return this.__boring ? STYLE_STRIP(result) : result;
	},
	readEntryFast: function (date, tag, text) {
		var stamp = makeStamp(new Date(+date), tag);
		if (this.__boring) {stamp = STYLE_STRIP(stamp);}
		if (this.__flat) {return stamp + text.replace(ansiRE, '') + '\n';}
		return stamp + text
			.replace(ansiRE, '')
			.replace(this.__context, this.__context.indent + '$1\n')
			.slice(this.__context.indent.length);
	},
	parseFile: function (filename) {
		var entries = STYLE_STRIP('' + fs.readFileSync(filename)).split('\uffff').slice(1);
		return {filename: '' + filename, entries: entries.map(formatEntryToJSON)};
	},
	parseEntry: function (entryText) {
		return formatEntryToJSON(STYLE_STRIP('' + entryText).replace('\uffff', ''));
	}
};
LogParser.parseFile = LogParser.prototype.parseFile;
LogParser.parseEntry = LogParser.prototype.parseEntry;

/*==========================*
|	   Format Functions		|
*===========================*/

function formatFlatEntry(entry) {
	var parts = entry.split('\ufffe'),
		date = new Date(+parts[0]),
		entry = parts[2];
	
	return makeStamp(date, parts[1]) + entry + '\n';
}

function formatEntry(entry) {
	var parts = entry.split('\ufffe'),
		date = new Date(+parts[0]),
		entry = parts[2];
	
	var result = '';
	if (date - this.previousDay > 86400000 || date.getDate() !== this.previousDay.getDate()) {
		this.previousDay = date;
		result += makeDateStamp(date);
	}
	
	result += makeStamp(date, parts[1]);
	var ansis = [];
	var indent;
	
	var ansisOffset = 0;
	var entryPlain = entry.replace(ansiRE, function (match, index) {
		ansis.push({index: index - ansisOffset, length: match.length});
		ansisOffset += match.length;
		return '';
	});
	
	var nextAnsi = ansis.shift();
	var linesOffset = 0;
	var match;
	while ((match = this.exec(entryPlain)) !== null) {
		if (linesOffset) {result += indent || (indent = this.indent);}
		var line = match[0];
		
		var ansisOffset = 0;
		var endOfLine = match.index + line.length;
		while (nextAnsi && nextAnsi.index <= endOfLine) {
			var ansiPositionInLine = nextAnsi.index - linesOffset + ansisOffset;
			line = line.slice(0, ansiPositionInLine) + entry.slice(nextAnsi.index, nextAnsi.length) + line.slice(ansiPositionInLine);
			ansisOffset += nextAnsi.length;
			nextAnsi = ansis.shift();
		}
		linesOffset += match[0].length;
		
		if (!match[2] && !match[3]) {line += '\n';}
		result += line;
	}
	
	this.lastIndex = 0;
	return result;
}

function formatEntryToJSON(entry) {
	var parts = entry.split('\ufffe');
	return {
		date: new Date(+parts[0]),
		tag: parts[1],
		content: parts[2],
	};
}

/*==========================*
|	  Utility Functions		|
*===========================*/

function newContext(outputWidth, indentLength) {
	var context = new RegExp('(.{1,' + (outputWidth - indentLength) + '})(\\n)?|(\\n)', 'g');
	context.indent = repeat(' ', indentLength);
	context.previousDay = new Date(0);
	return context;
}

function makeSeperator(text, width) {
	text = ' ' + text + ' ';
	var bar = repeat('\u2014', width - text.length);
	return STYLE_TITLE(bar + text + '\n');
}

function makeStamp(date, tag) {
	// Must always return a string of constant length, unless locale is changed.
	// (ANSI escape codes do not count towards length)
	switch (tag) {
		case 'INFO': var style = STYLE_INFO; break;
		case 'WARN': var style = STYLE_WARN; break;
		case 'ERRR': var style = STYLE_ERRR; break;
		default: var style = STYLE_NONE;
	}
	return style(twoDigits(date.getHours())
		+ ':' + twoDigits(date.getMinutes())
		+ ':' + twoDigits(date.getSeconds())
		+ '.' + threeDigits(date.getMilliseconds())
		+ ' ' + tag + ' \u2014 ');
}

function makeDateStamp(date) {
	return STYLE_DATE(date.toDateString()) + '\n';
}

function repeat(letter, n) {
	var total = '';
	while (n-- > 0) {total += letter;}
	return total;
}

function twoDigits(n) {
	return (~~n > 9 ? '' : '0') + ~~n;
}

function threeDigits(n) {
	return (~~n < 100 ? (~~n < 10 ? '00' : '0') : '') + ~~n;
}

function calcDefaultIndentLength() {
	return STYLE_STRIP(makeStamp(new Date, repeat('X', ~~TAG_LENGTH))).length;
}
