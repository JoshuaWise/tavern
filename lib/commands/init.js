/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
var path = require('path');
var Command = require('../command.js');

module.exports = Command.extend({
	knownOptions: {'production': Boolean},
	knownShorthands: {'p': '--production'},
	maxRemainingArgs: 1,
	execute: function(args) {
		var dir = path.resolve(process.cwd(), args[0] || '');
		console.log(dir);
	}
});