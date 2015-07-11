/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
require('./setup-process');
var http = require('http');
var logger = require('./logger').hook();
var getAvailablePort = require('./get-available-port');

process.on('message', function (json) {
	var options = JSON.parse(json);
	if (options.attach) {
		logger.prettyTerminal = true;
		process.on('disconnect', function () {
			logger.log('Attached Tavern CLI was terminated. Server will now exit.');
			process.exit(0);
		});
	}
	getAvailablePort(function (PORT) {
		var server = http.createServer(serve);
		server.listen(PORT, function () {
			logger.log('Server listening on: http://localhost:%s', PORT);
			if (!options.attach) {logger.disableSTDO();}
			process.send('RUNNING');
			setInterval(function () {
				logger('ping');
			}, 1000);
		});
	});
});

function serve(req, res) {
	res.end('this server is in ' + process.cwd());
}