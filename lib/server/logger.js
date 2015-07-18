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
var Promise = require('bluebird');
var LogParser = require('../log-parser');

if (process.env.NODE_ENV !== 'production') {Promise.longStackTraces();}
var specialCharsRE = /\uffff|\ufffe/g;
var enabled = false;
var writeToTerminal = false;
var stream = null;
var logParser = null;

var Logger = module.exports = function Logger() {
	return Logger.log.apply(Logger, arguments);
};
Logger.log = function () {
	return enabled ? writeToLog(Date.now(), 'INFO', printf.apply(null, arguments), process.stdout)
				   : Promise.resolve();
};
Logger.warn = function () {
	return enabled ? writeToLog(Date.now(), 'WARN', printf.apply(null, arguments), process.stderr)
				   : Promise.resolve();
};
Logger.error = function () {
	return enabled ? writeToLog(Date.now(), 'ERRR', printf.apply(null, arguments), process.stderr)
				   : Promise.resolve();
};
Logger.hook = function (uid) {
	if (!stream) {
		var logPath = path.join(process.argv[2], 'logs', uid + '.log');
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
	if (stream) {
		enabled = true;
	}
	return Logger;
};
Object.defineProperty(Logger, 'writeToTerminal', {
	get: function () {return writeToTerminal;},
	set: function (val) {writeToTerminal = !!val;}
});

function writeToLog(date, tag, text, stdo) {
	var cleanText = text.replace(specialCharsRE, '\ufffd');
	var log = '\uffff' + date + '\ufffe' + tag + '\ufffe' + cleanText;
	
	writeToTerminal && stdo.write(logParser.readEntryFast(date, tag, cleanText));
	return new Promise(function (resolve, reject) {
		stream.write(log, resolve);
	});
}

function createLogParser() {
	var options = {};
	if (!logParser) {
		process.stdout.on('resize', createLogParser);
	}
	logParser = new LogParser(options);
}
