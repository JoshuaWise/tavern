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
var fs = require('fs-extra');
var spawn = require('child_process').spawn;
var find = require('find');
var LogParser = require('../../log-parser');
var Command = require('../command');

module.exports = Command.extend({
	knownOptions: {'all': Boolean, 'clear': Boolean, 'flat': Boolean, 'boring': Boolean, 'output': Boolean, 'width': Number, 'json': Boolean, 'multiple': Number},
	knownShorthands: {'a': '--all', 'c': '--clear', 'f': '--flat', 'b': '--boring', 'o': '--output', 'w': '--width', 'j': '--json', 'm': '--multiple'},
	maxRemainingArgs: 0,
	tavernDirectoryRequired: true,
	execute: function (done, args, tavernDir) {
		var logsPath = path.join(tavernDir, 'logs');
		
		if (this.options.clear) {
			fs.emptyDirSync(logsPath);
			console.log('Logs have been cleared.');
			done();
		}
		
		fs.mkdirsSync(logsPath);
		var filenames = find.fileSync(/\.log$/i, logsPath);
		
		if (!filenames.length) {
			console.log('No log files were found.');
			done();
		}
		
		var log = getLog(sliceFileNames(filenames, this.options), this.options);
		
		if (process.stdout.isTTY && !this.options.output) {
			var child = spawn('less',
				['--tilde', this.options.header ? '-R' : '-RFX'],
				{stdio: ['pipe', 'inherit', 'inherit']});
			child.stdin.write(log);
			child.stdin.destroy();
			child.on('exit', done);
		} else {
			process.stdout.write(log);
			done();
		}
	}
});

function sliceFileNames(filenames, options) {
	var last = filenames.length - 1;
	if (options.all) {
		last = 0;
		options.header = true;
	} else if (Number.isFinite(options.multiple)) {
		last = Math.max(0, filenames.length - options.multiple);
		options.header = true;
	}
	return filenames.slice(last).reverse();
}

function getLog(filenames, options) {
	if (options.json) {
		var json = filenames.map(function (filename) {return this.parseFile(filename);}, LogParser);
		return options.header ? JSON.stringify(json) : JSON.stringify(json[0].entries);
	}
	
	return filenames
		.map(function (filename) {return this.readFile(filename);}, new LogParser(options))
		.join('\n\n');
}

