/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
var extractNextArgument = require('./extract-next-argument');

module.exports = function (done, commandName) {
	if (commandName === 'help') {commandName = extractNextArgument();}
	
	if (!commandName) {
		console.log('General help.');
	} else {
		console.log('Help for command \'' + commandName + '\'.');
	}
	done();
};
