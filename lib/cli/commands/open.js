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
var SERVER_PATH = path.resolve(__dirname, '../../server/tavern-master.js');

module.exports = Command.extend({
	knownOptions: {'attach': Boolean, 'workers': Number},
	knownShorthands: {'a': '--attach', 'w': '--workers'},
	maxRemainingArgs: 0,
	tavernDirectoryRequired: true,
	execute: function (done, args, tavernDir) {
		if (ph.serverIsRunning(tavernDir)) {
			console.log('Tavern is already open.');
			done();
		}
		
		var child = fork(SERVER_PATH, [tavernDir], {
			cwd: path.dirname(tavernDir),
			silent: false
		});
		ph.writePID(tavernDir, child.pid);
		
		child.on('exit', done);
		if (this.options.attach) {
			// When terminated, don't exit (so we don't release terminal control).
			// Instead, let the child exit, and we'll gracefully die afterwards.
			var closeProcess = function () {if (child.connected) child.disconnect();};
			process
				.on('SIGTERM', closeProcess)
				.on('SIGABRT', closeProcess)
				.on('SIGQUIT', closeProcess)
				.on('SIGINT', closeProcess)
				.on('SIGHUP', closeProcess);
		} else {
			child.once('message', function (msg) {
				if (msg === 'FAIL') {
					console.log('Tavern failed to open. Type \'tavern log\' for details.');
				} else {
					console.log('Tavern opened at %s://%s:%d', msg.protocol, msg.hostname, msg.port);
				}
				done();
			});
		}
		
		child.send(JSON.stringify(this.options, Object.getOwnPropertyNames(this.knownOptions)));
	}
});
