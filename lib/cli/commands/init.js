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
var execFileSync = require('child_process').execFileSync;
var fs = require('fs-extra');
var findup = require('findup-sync');
var Command = require('../command');
var TEMPLATE_PATH = path.resolve(__dirname, '../../../init/template');
var INIT_SCRIPT_PATH = path.resolve(__dirname, '../../../init/init');

module.exports = Command.extend({
	knownOptions: {'production': Boolean},
	knownShorthands: {'p': '--production'},
	maxRemainingArgs: 1,
	execute: function (done, args) {
		var dest = path.resolve(process.cwd(), args[0] || '');
		
		if (findup('.tavern', {cwd: dest, nocase: true}) !== null) {
			console.error('A Tavern project cannot exist inside another Tavern project!');
			process.exit(1);
		}
		
		copyTemplate(dest);
		runInitScript(dest);
		
		console.log('Done!');
		done();
	}
});

function copyTemplate(dest) {
	console.log('Creating files...');
	fs.mkdirsSync(dest);
	fs.copySync(TEMPLATE_PATH, dest);
	console.log('Initialized Tavern project in ' + dest + '/');
}

function runInitScript(dest) {
	try {
		execFileSync(INIT_SCRIPT_PATH, [dest], {
			cwd: dest,
			stdio: 'inherit'
		});
	} catch (err) {
		console.error('\nERROR in init script: ' + INIT_SCRIPT_PATH);
	}
}
