/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
var printf = require('util').format;
var path = require('path');
var fs = require('fs-extra');
var LogParser = require('../log-parser');

var specialCharsRE = /\uffff|\ufffe/g;
var enabled = false;
var prettyTerminal = false;
var stream = null;
var logParser;

var Logger = module.exports = function Logger() {
	Logger.log.apply(Logger, arguments);
};
Logger.log = function () {
	enabled && writeToLog(Date.now(), 'INFO', printf.apply(null, arguments));
	return Logger;
};
Logger.warn = function () {
	enabled && writeToLog(Date.now(), 'WARN', printf.apply(null, arguments));
	return Logger;
};
Logger.error = function () {
	enabled && writeToLog(Date.now(), 'ERRR', printf.apply(null, arguments));
	return Logger;
};
Logger.hook = function () {
	if (!stream) {
		var logPath = path.join(process.argv[2], 'logs', process.argv[3] + '.log');
		fs.mkdirsSync(path.dirname(logPath));
		stream = fs.createWriteStream(logPath, {flags: 'a', encoding: 'utf8'});
		createLogParser();
	}
	Logger.enable();
	return Logger;
};
Logger.unhook = function () {
	if (stream) {
		stream.destroy();
		stream = null;
	}
	Logger.disable();
	return Logger;
};
Logger.disable = function () {
	enabled = false;
	return Logger;
};
Logger.enable = function () {
	stream && (enabled = true);
	return Logger;
};
Object.defineProperty(Logger, 'prettyTerminal', {
	get: function () {return prettyTerminal;},
	set: function (val) {prettyTerminal = !!val;}
});

function writeToLog(date, tag, text) {
	var cleanText = text.replace(specialCharsRE, '\ufffd');
	stream.write('\uffff' + date + '\ufffe' + tag + '\ufffe' + cleanText);
	
	prettyTerminal ? process.stdout.write(logParser.readEntryFast(date, tag, cleanText))
				   : process.stdout.write(cleanText + '\n');
}

function createLogParser() {
	var options = {};
	if (!logParser) {
		process.stdout.on('resize', createLogParser);
	}
	logParser = new LogParser(options);
}
