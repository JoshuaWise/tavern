/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
var findup = require('findup-sync');
var Command = require('../command');

module.exports = Command.extend({
	maxRemainingArgs: 0,
	execute: function() {
		var dir = findup('.tavern', {nocase: true});
		
		if (dir === null) {
			return console.error('You are not in a Tavern directory.');
		}
		
		console.log('I can open this Tavern!');
	}
});