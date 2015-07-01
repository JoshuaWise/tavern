/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
var Command = require('../command');

module.exports = Command.extend({
	knownOptions: {'force': Boolean},
	knownShorthands: {'f': '--force'},
	maxRemainingArgs: 0,
	tavernDirectoryRequired: true,
	execute: function(args, tavernDir) {
		console.log('I can close this Tavern!');
	}
});