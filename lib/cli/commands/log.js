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
	execute: function (args, tavernDir) {
		var isTTY = process.stdout.isTTY;
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
			log += formatLogFile(filenames[i]);
			if (!this.options.all) {break;}
			if (i > 0) {log += '\n\n';}
		}
		
		if (isTTY && (this.options.all || log.split('\n').length > process.stdout.rows)) {
			var child = spawn('less', ['--tilde', '-R'], {stdio: ['pipe', 'inherit', 'inherit']});
			child.stdin.write(log + '\n');
			child.stdin.destroy();
		} else {
			process.stdout.write(log);
		}
	}
});

var formatLogFile = (function () {
	
	var ansiRE = require('ansi-regex')();
	
	function notEmpty(entry) {
		return !!entry.trim();
	}
	
	function makeSeperator(text) {
		text = ' ' + text + ' ';
		var bar = repeat('\u2014', (process.stdout.columns || 80) - text.length);
		return bar + text + '\n';
	}
	
	function repeat(letter, n) {
		var total = '';
		while (n-- > 0) {total += letter;}
		return total;
	}
	
	function formatLogEntry(entry) {
		var parts = entry.split('\ufffd'),
			result = parts[0],
			entry = parts[1];
		
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
			if (linesOffset) {result += indent || (indent = repeat(' ', this.indentLength));}
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
			
			if (!match[1] && !match[2]) {line += '\n';}
			result += line;
		}
		
		this.lastIndex = 0;
		return result;
	}
	
	return function (filename) {
		var sections = ('' + fs.readFileSync(filename))
			.split('\ufffc')
			.filter(notEmpty);
		var indentLength = ~~sections.shift() || 8;
		var context = new RegExp('.{1,' + ((process.stdout.columns || 80) - indentLength) + '}(\\n)?|(\\n)', 'g');
		context.indentLength = indentLength;
		
		return makeSeperator(path.basename(filename))
			 + sections.map(formatLogEntry, context).join('');
	};
}());

