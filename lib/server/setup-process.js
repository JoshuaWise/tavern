/*
 * tavern
 * https://github.com/JoshuaWise/tavern
 *
 * Copyright (c) 2015 Joshua Wise, contributors
 * Licensed under the MIT license.
 * https://github.com/JoshuaWise/tavern/LICENSE
 */

'use strict';

process.title = 'tavern';
process.argv[3] = Date.now() + '-' + process.pid;
Object.freeze(process.argv);
