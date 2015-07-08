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
var specialCharsRE = /\ufffc|\ufffd/g;
var previousDay = new Date(0);
var fd;

var Logger = module.exports = function Logger() {
	var logger = newLoggerInstance();
	logger.stream = fs.createWriteStream(null, {fd: fd != null ? fd : createFD(), encoding: 'utf8'});
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
Logger.prototype.__proto__ = Function.prototype;

function newLoggerInstance() {
	function logger() {
		Logger.prototype.log.apply(logger, arguments);
	}
	logger.__proto__ = Logger.prototype;
	return logger;
}

function createFD() {
	var logPath = path.join(process.argv[2], 'logs', process.argv[3] + '.log');
	fs.mkdirsSync(path.dirname(logPath));
	fd = fs.openSync(logPath, 'w');
	fs.writeSync(fd, '\ufffc' + makeStamp(new Date, 'ABCD').length + '\ufffc\n'); // length of indentation
	return fd;
}

function writeToLog(stream, date, text, tag, style) {
	stream.write('\ufffc' // start marker
		+ getDateStamp(date)
		+ style(makeStamp(date, tag))
		+ '\ufffd' // main text start marker
		+ text.replace(specialCharsRE, '')
		+ '\n');
}

function makeStamp(date, tag) {
	return twoDigits(date.getHours())
		+ ':' + twoDigits(date.getMinutes())
		+ ':' + twoDigits(date.getSeconds())
		+ '.' + threeDigits(date.getMilliseconds())
		+ ' ' + tag + ' \u2014 ';
}

function getDateStamp(date) {
	if (date - previousDay > 86400000) {
		previousDay = new Date(date);
		return clc.magenta(date.toDateString()) + '\n';
	}
	return '';
}

function twoDigits(n) {
	return (~~n > 9 ? '' : '0') + ~~n;
}
function threeDigits(n) {
	return (~~n < 100 ? (~~n < 10 ? '00' : '0') : '') + ~~n;
}