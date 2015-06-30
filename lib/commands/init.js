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
var fse = require('fs-extra');
var findup = require('findup-sync');
var Command = require('../command.js');

var templatePath = path.resolve(__dirname, '../../init/template');
var initScriptPath = path.resolve(__dirname, '../../init/init');

module.exports = Command.extend({
	knownOptions: {'production': Boolean},
	knownShorthands: {'p': '--production'},
	maxRemainingArgs: 1,
	execute: function(args) {
		var dest = path.resolve(process.cwd(), args[0] || '');
		
		if (findup('.tavern', {cwd: dest, nocase: true}) !== null) {
			return console.error('A Tavern project cannot exist inside another Tavern project!');
		}
		
		copyTemplate(dest);
		runInitScript(dest);
		
		console.log('Done!');
	}
});

function copyTemplate(dest) {
	console.log('Creating files...');
	fse.mkdirsSync(dest);
	fse.copySync(templatePath, dest);
	console.log('Initialized Tavern project in ' + dest + '/');
}

function runInitScript(dest) {
	try {
		execFileSync(initScriptPath, [], {
			cwd: dest,
			stdio: 'inherit',
			env: process.env,
			uid: process.getuid(),
			gid: process.getgid()
		});
	} catch (err) {
		console.error('\nERROR in init script: ' + initScriptPath);
	}
}

