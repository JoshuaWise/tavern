/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';

module.exports = function extractNextArgument() {
	var args = process.argv;
	for (var i=2, len=args.length; i<len; i++) {
		if (args[i] && args[i].charAt(0) != '-') {
			return process.argv.splice(i, 1)[0];
		}
	}
	return '';
};
