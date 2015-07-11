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
	enabled && writeToLog(Date.now(), 'INFO', printf.apply(null, arguments), process.stdout);
	return Logger;
};
Logger.warn = function () {
	enabled && writeToLog(Date.now(), 'WARN', printf.apply(null, arguments), process.stderr);
	return Logger;
};
Logger.error = function () {
	enabled && writeToLog(Date.now(), 'ERRR', printf.apply(null, arguments), process.stderr);
	return Logger;
};
Logger.logSync = function () {
	enabled && writeToLog(Date.now(), 'INFO', printf.apply(null, arguments), process.stdout, true);
	return Logger;
};
Logger.warnSync = function () {
	enabled && writeToLog(Date.now(), 'WARN', printf.apply(null, arguments), process.stderr, true);
	return Logger;
};
Logger.errorSync = function () {
	enabled && writeToLog(Date.now(), 'ERRR', printf.apply(null, arguments), process.stderr, true);
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
	process.removeListener('uncaughtException', caughtException);
	enabled = false;
	return Logger;
};
Logger.enable = function () {
	if (stream) {
		process.on('uncaughtException', caughtException);
		enabled = true;
	}
	return Logger;
};
Logger.disableSTDO = function disableSTDO() {
	var stdoutWrite = process.stdout.write;
	var stderrWrite = process.stderr.write;
	process.stderr.write = process.stdout.write = function () {return true;};
	Logger.enableSTDIO = function enableSTDIO() {
		process.stdout.write = stdoutWrite;
		process.stderr.write = stderrWrite;
		Logger.disableSTDO = disableSTDO;
		Logger.enableSTDIO = function () {return Logger;};
		return Logger;
	};
	Logger.disableSTDO = function () {return Logger;};
	return Logger;
};
Logger.enableSTDIO = function () {
	return Logger;
};
Object.defineProperty(Logger, 'prettyTerminal', {
	get: function () {return prettyTerminal;},
	set: function (val) {prettyTerminal = !!val;}
});

function writeToLog(date, tag, text, stdo, sync) {
	var cleanText = text.replace(specialCharsRE, '\ufffd');
	var log = '\uffff' + date + '\ufffe' + tag + '\ufffe' + cleanText;
	sync ? fs.writeSync(stream.fd, log) : stream.write(log);
	
	prettyTerminal ? stdo.write(logParser.readEntryFast(date, tag, cleanText))
				   : stdo.write(cleanText + '\n');
}

function createLogParser() {
	var options = {};
	if (!logParser) {
		process.stdout.on('resize', createLogParser);
	}
	logParser = new LogParser(options);
}

function caughtException(err) {
	try {
		var message = 'Uncaught Error!\n' + (err instanceof Error ? err.stack : '' + err);
		Logger.errorSync(message);
		process.exit(1);
	} catch (newErr) {
		throw err;
	}
}
