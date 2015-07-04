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

process.on('message', function (message) {
	if (message === 'ATTACH') {
		process.on('disconnect', function () {
			console.log('Attached Tavern CLI was terminated. Server will now exit.');
			process.exit(0);
		});
	}
});

getAvailablePort(function (PORT) {
	var server = http.createServer(function (req, res) {
		res.end('this server is in ' + process.cwd());
	});
	
	server.listen(PORT, function () {
		console.log("Server listening on: http://localhost:%s", PORT);
		process.send('RUNNING');
	});
});




// var logsPath = path.join(tavernDir, 'logs');
// fs.mkdirsSync(logsPath);
// var logStream = fs.openSync(path.join(logsPath, Date.now() + '-' + process.pid + '.log'), 'w');