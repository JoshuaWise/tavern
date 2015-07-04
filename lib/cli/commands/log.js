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
var Command = require('../command');

module.exports = Command.extend({
	knownOptions: {'all': Boolean, 'clear': Boolean},
	knownShorthands: {'a': '--all', 'c': '--clear'},
	maxRemainingArgs: 0,
	tavernDirectoryRequired: true,
	execute: function(args, tavernDir) {
		if (!process.stdout.isTTY) {
			console.error('This command is only available in a TTY context.');
			process.exit(1);
		}
		
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
		
		var log = '';
		for (var i=filenames.length-1; i>=0; i--) {
			log += makeSeperator(path.basename(filenames[i]));
			log += fs.readFileSync(filenames[i]) + '\n\n';
			if (!this.options.all) {break;}
		}
		
		if (this.options.all || log.split('\n').length > process.stdout.rows) {
			var child = spawn('less', ['--tilde'], {stdio: ['pipe', 'inherit', 'inherit']});
			child.stdin.write(log);
			child.stdin.destroy();
		} else {
			process.stdout.write(log);
		}
	}
});

function makeSeperator(text) {
	text = text + ' ';
	var suffix = repeat('\u2014', process.stdout.columns - text.length - 1);
	return text + suffix + '\n';
}

function repeat(letter, n) {
	var total = '';
	while (n-- > 0) {total += letter;}
	return total;
}
