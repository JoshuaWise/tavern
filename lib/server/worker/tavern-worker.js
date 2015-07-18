/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
process.title = 'tavern-worker';
var cluster = require('cluster');
var http = require('http');

var server = http.createServer(serve);
server.listen(process.env.TAVERN_PORT, function () {
	
});

function serve(req, res) {
	res.end('this server is in ' + process.cwd());
}