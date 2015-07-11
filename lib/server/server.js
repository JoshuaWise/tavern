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
			if (!options.attach) {disableSTDO();}
			process.send('RUNNING');
			
			setInterval(function () {
				logger.error('ping');
				logger('This is a normal log.\nHere I can give information about things.');
				logger.warn('The programmer has done something that makes me itch - it\'s not totally broken, but it could cause problems down the road.');
			}, 500);
		});
	});
});

function disableSTDO() {
	process.stderr.write = process.stdout.write = function () {return true;};
}

function serve(req, res) {
	res.end('this server is in ' + process.cwd());
}