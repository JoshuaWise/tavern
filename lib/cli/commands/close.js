/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';
var ph = require('../process-handling');
var Command = require('../command');

module.exports = Command.extend({
	knownOptions: {'force': Boolean},
	knownShorthands: {'f': '--force'},
	maxRemainingArgs: 0,
	tavernDirectoryRequired: true,
	execute: function (done, args, tavernDir) {
		if (ph.terminateServer(tavernDir, this.options.force)) {
			var msg = 'Tavern has been ' + (this.options.force ? 'forcefully ' : '') + 'closed.';
			ph.whenServerIsClosed(tavernDir, function () {
				console.log(msg);
				done();
			});
		} else {
			console.log('Tavern is already closed.');
			done();
		}
	}
});
