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

var http = require('http');
var getAvailablePort = require('./get-available-port');

getAvailablePort(function (PORT) {
	var server = http.createServer(function (req, res) {
		res.end('this server is in ' + process.cwd());
	});
	
	server.listen(PORT, function () {
		console.log("Server listening on: http://localhost:%s", PORT);
	});
});