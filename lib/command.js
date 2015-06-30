/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
var Class = require('strict-class');

module.exports = Class.extend({
	constructor: function Command(commandName) {
		this.knownOptions.help = Boolean; // Ensure that every command has the help option.
		this.options = require('./cli-options')(this.knownOptions, this.knownShorthands);
		
		if (this.options.help) {
			require('./cli-help')(commandName);
		} else {
			var remain = this.options.argv.remain;
			if (this.maxRemainingArgs >= 0 && remain.length > this.maxRemainingArgs) {
				console.error('Too many arguments. See \'tavern help ' + commandName + '\' to learn more.');
			} else if (this.minRemainingArgs >= 0 && remain.length < this.minRemainingArgs) {
				console.error('Too few arguments. See \'tavern help ' + commandName + '\' to learn more.');
			} else {
				this.execute(remain);
			}
		}
	},
	knownOptions: {},
	knownShorthands: {},
	minRemainingArgs: -1,
	maxRemainingArgs: -1,
	execute: function() {}
});