/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';

var net = require('net');
var FIRST_PORT = 8000;
var LAST_PORT = 65535;

module.exports = function getAvailablePort(callback) {
	var port = FIRST_PORT - 1;
	var limit = LAST_PORT;
	
	var server = net.createServer();
	server.once('listening', foundPort);
	server.on('error', checkNext);
	
	checkNext();
	function checkNext() {
		if (++port > limit) {throw new Error('ERROR: All ports are in use.');}
		server.listen(port);
	}
	function foundPort() {
		server.once('close', function () {callback(port);});
		server.close();
	}
};