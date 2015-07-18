/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';

var os = require("os");

module.exports = function getIPV4() {
	var networkInterfaces = os.networkInterfaces();
	for (var device in networkInterfaces) {
		for (var index in networkInterfaces[device]) {
			var address = networkInterfaces[device][index];
			if (address.family === 'IPv4' && !address.internal) {
				return address.address;
			}
		}
	}
	return 'localhost';
};