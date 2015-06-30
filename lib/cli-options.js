/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';

// Option Parser.
var nopt = require('nopt');

// Parse process arguments and return an options object.
module.exports = function(options, shorthands) {
	return nopt(options, shorthands, process.argv, 3);
};