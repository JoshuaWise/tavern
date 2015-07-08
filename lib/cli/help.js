/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';

module.exports = function (commandName) {
	if (commandName === 'help') {commandName = getCommandName();}
	
	if (!commandName) {
		console.log('General help.');
	} else {
		console.log('Help for command \'' + commandName + '\'.');
	}
};

function getCommandName() {
	var args = process.argv.slice(2);
	for (var i=0, len=args.length; i<len; i++) {
		if (args[i] === 'help') {return args[i + 1];}
	}
	return '';
}