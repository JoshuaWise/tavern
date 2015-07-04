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
var fork = require('child_process').fork;
var ph = require('../process-handling');
var Command = require('../command');
var SERVER_PATH = path.resolve(__dirname, '../../server/server.js');

module.exports = Command.extend({
	knownOptions: {'attach': Boolean},
	knownShorthands: {'a': '--attach'},
	maxRemainingArgs: 0,
	tavernDirectoryRequired: true,
	execute: function (args, tavernDir) {
		if (ph.serverIsRunning(tavernDir)) {
			console.log('Server is already running.');
			process.exit(0);
		}
		
		var attached = this.options.attach;
		var running = false;
		var child = fork(SERVER_PATH, [tavernDir], {
			cwd: path.dirname(tavernDir),
			silent: false,
			uid: process.getuid(),
			gid: process.getgid()
		});
		
		if (attached) {child.send('ATTACH');}
		
		child.on('disconnect', function () {
			var msg = running ? 'Server has stopped running. The Tavern CLI will now exit.'
							  : 'Server failed to start.';
			console.log(msg); // CLI will now exit because its event loop is empty.
		});
		
		child.on('message', function (message) {
			if (message === 'RUNNING') {
				if (!attached) {process.exit(0);}
				running = true;
			}
		});
		
		ph.writePID(tavernDir, child.pid);
	}
});
