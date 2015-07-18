/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
module.exports = function (done, commandName) {
	if (commandName === 'help') {commandName = require('./extract-next-argument')();}
	
	if (!commandName) {
		console.log('General help.');
	} else {
		console.log('Help for command \'' + commandName + '\'.');
	}
	done();
};
