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
var clc = require('cli-color');

var NOOP = function NOOP() {};
var specialCharsRE = /\ufffc|\ufffd/g;
var previousDay = new Date(0);
var fd;

var Logger = module.exports = function Logger() {
	var logger = newLoggerInstance();
	logger.stream = fs.createWriteStream(null, {fd: fd == null ? makeFD() : fd, encoding: 'utf8'});
	return logger;
};
Logger.prototype = {
	constructor: Logger,
	log: function () {
		writeToLog(this.stream, new Date, printf.apply(null, arguments), 'INFO', clc.green);
	},
	warn: function () {
		writeToLog(this.stream, new Date, printf.apply(null, arguments), 'WARN', clc.yellow);
	},
	error: function () {
		writeToLog(this.stream, new Date, printf.apply(null, arguments), 'ERRR', clc.red);
	}
};
Logger.prototype.__proto__ = Logger;

Logger.disable = function disable() {
	var disabled = {
		log: Logger.prototype.log,
		warn: Logger.prototype.warn,
		error: Logger.prototype.error
	};
	for (var key in disabled) {Logger.prototype[key] = NOOP;}
	Logger.enable = function enable() {
		for (var key in disabled) {Logger.prototype[key] = disabled[key];}
		Logger.disable = disable;
		Logger.enable = function () {};
	};
	Logger.disable = function () {};
};
Logger.enable = function () {};
Logger.clc = clc;

function newLoggerInstance() {
	function logger() {
		Logger.prototype.log.apply(logger, arguments);
	}
	logger.__proto__ = Logger.prototype;
	return logger;
}

function makeFD() {
	var logPath = path.join(process.argv[2], 'logs', process.argv[3] + '.log');
	fs.mkdirsSync(path.dirname(logPath));
	fd = fs.openSync(logPath, 'a');
	if (fileIsEmpty(logPath)) {
		// Write length of indentation to first line.
		fs.writeSync(fd, '\ufffc' + makeStamp(new Date, 'ABCD').length + '\ufffc\n');
	}
	return fd;
}

function fileIsEmpty(path) {
	try {return !fs.readFileSync(path).length;} catch (err) {return true;}
}

function writeToLog(stream, date, text, tag, style) {
	var stamp = style(makeStamp(date, tag));
	var cleanText = text.replace(specialCharsRE, '') + '\n';
	stream.write(getDateStamp(date)
		+ '\ufffc' + stamp
		+ '\ufffd' + cleanText);
	process.stdout.write(stamp + cleanText);
}

function getDateStamp(date) {
	if (date - previousDay > 86400000) {
		previousDay = new Date(date);
		return '\ufffc' + clc.magenta.bold.underline(date.toDateString()) + '\n';
	}
	return '';
}

function makeStamp(date, tag) {
	// Should always return a string of constant length, unless locale is changed.
	return twoDigits(date.getHours())
		+ ':' + twoDigits(date.getMinutes())
		+ ':' + twoDigits(date.getSeconds())
		+ '.' + threeDigits(date.getMilliseconds())
		+ ' ' + tag + ' \u2014 ';
}

function twoDigits(n) {
	return (~~n > 9 ? '' : '0') + ~~n;
}
function threeDigits(n) {
	return (~~n < 100 ? (~~n < 10 ? '00' : '0') : '') + ~~n;
}