/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
process.title = 'tavern';
process.argv[3] = Date.now() + '-' + process.pid;
Object.freeze(process.argv);

var http = require('http');
var logger = new (require('./logger'));
var getAvailablePort = require('./get-available-port');

process.on('message', function (message) {
	if (message === 'ATTACH') {
		process.on('disconnect', function () {
			logger.log('Attached Tavern CLI was terminated. Server will now exit.');
			process.exit(0);
		});
	}
});

getAvailablePort(function (PORT) {
	var server = http.createServer(function (req, res) {
		res.end('this server is in ' + process.cwd());
	});
	
	server.listen(PORT, function () {
		logger.log("Server listening on: http://localhost:%s", PORT);
		process.send('RUNNING');
		logger('This is a normal log.\nHere I can give information about things.');
		logger.warn('The programmer has done something that makes me itch - it\'s not totally broken, but it could cause problems down the road.');
		logger.error('A problem occurred!\nERROR ERROR\nEVERYTHING IS DEAD\nBLOW IT UP!');
	});
});

