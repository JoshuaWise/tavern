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
	knownOptions: {'all': Boolean, 'clear': Boolean, 'flat': Boolean, 'boring': Boolean, 'output': Boolean, 'width': Number, 'json': Boolean},
	knownShorthands: {'a': '--all', 'c': '--clear', 'f': '--flat', 'b': '--boring', 'o': '--output', 'w': '--width', 'j': '--json'},
	maxRemainingArgs: 0,
	tavernDirectoryRequired: true,
	execute: function (args, tavernDir) {
		var logsPath = path.join(tavernDir, 'logs');
		
		if (this.options.clear) {
			fs.emptyDirSync(logsPath);
			console.log('Logs have been cleared.');
			process.exit(0);
		}
		
		fs.mkdirsSync(logsPath);
		var filenames = find.fileSync(/\.log$/i, logsPath);
		
		if (!filenames.length) {
			console.log('No log files were found.');
			process.exit(0);
		}
		
		var logParser = new LogParser(this.options);
		var log = '';
		
		if (this.options.json) {
			var json = [];
			for (var i=filenames.length-1; i>=0; i--) {
				json.push(logParser.parseFile(filenames[i]));
				if (!this.options.all) {json = json[0].entries; break;}
			}
			log = JSON.stringify(json);
		} else {
			for (var i=filenames.length-1; i>=0; i--) {
				log += logParser.readFile(filenames[i]);
				if (!this.options.all) {break;}
				if (i > 0) {log += '\n\n';}
			}
		}
		
		if (process.stdout.isTTY && !this.options.output) {
			var child = spawn('less',
				['--tilde', this.options.all ? '-R' : '-RFX'],
				{stdio: ['pipe', 'inherit', 'inherit']});
			child.stdin.write(log);
			child.stdin.destroy();
		} else {
			process.stdout.write(log);
		}
	}
});
