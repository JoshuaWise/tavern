/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
var nopt = require('nopt');
var findup = require('findup-sync');
var Class = require('strict-class');

module.exports = Class.extend({
	constructor: function Command(commandName) {
		this.knownOptions.help = Boolean; // Ensure that every command has the help option.
		this.options = nopt(this.knownOptions, this.knownShorthands, process.argv, 3);
		
		if (this.options.help) {
			require('./help')(commandName);
		} else {
			var remain = this.options.argv.remain;
			var tavernDir = findup('.tavern', {nocase: true});
			
			if (this.maxRemainingArgs >= 0 && remain.length > this.maxRemainingArgs) {
				console.error('Too many arguments. See \'tavern help ' + commandName + '\' to learn more.');
				process.exit(1);
			}
			if (this.minRemainingArgs >= 0 && remain.length < this.minRemainingArgs) {
				console.error('Too few arguments. See \'tavern help ' + commandName + '\' to learn more.');
				process.exit(1);
			}
			if (this.tavernDirectoryRequired && tavernDir === null) {
				console.error('You are not in a Tavern directory.');
				process.exit(1);
			}
			
			this.execute(remain, tavernDir);
		}
	},
	knownOptions: {},
	knownShorthands: {},
	minRemainingArgs: -1, // -1 means no limit
	maxRemainingArgs: -1, // -1 means no limit
	tavernDirectoryRequired: false,
	execute: function() {}
});