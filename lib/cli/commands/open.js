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
var Command = require('../command');
var SERVER_PATH = path.resolve(__dirname, '../../server/server.js');

module.exports = Command.extend({
	knownOptions: {'attach': Boolean},
	knownShorthands: {'a': '--attach'},
	maxRemainingArgs: 0,
	tavernDirectoryRequired: true,
	execute: function(args, tavernDir) {
		var logsPath = path.join(tavernDir, 'logs');
		fs.mkdirsSync(logsPath);
		var logStream = fs.openSync(path.join(logsPath, Date.now() + '-' + process.pid + '.log'), 'w');
		var workingDir = path.dirname(tavernDir);
		
		var child = spawn(process.execPath, [SERVER_PATH], {
			cwd: workingDir,
			stdio: this.options.attach ? 'inherit' : ['ignore', logStream, logStream],
			uid: process.getuid(),
			gid: process.getgid(),
			detached: !this.options.attach
		});
		
		if (!this.options.attach) {
			child.unref();
		}
	}
});