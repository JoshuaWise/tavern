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
var fse = require('fs-extra');
var findup = require('findup-sync');
var Command = require('../command.js');

module.exports = Command.extend({
	knownOptions: {'production': Boolean},
	knownShorthands: {'p': '--production'},
	maxRemainingArgs: 1,
	execute: function(args) {
		var source = path.resolve(__dirname, '../../init');
		var dest = path.resolve(process.cwd(), args[0] || '');
		
		if (findup('.tavern', {cwd: dest, nocase: true}) !== null) {
			return console.error('A Tavern project cannot exist inside another Tavern project!');
		}
		fse.mkdirsSync(dest);
		fse.copySync(source, dest);
		console.log('Tavern project initialized at ' + dest);
	}
});