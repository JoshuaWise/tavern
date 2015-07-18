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
var path = require('path');
var cluster = require('cluster');
var logger = require('./logger').hook(Date.now() + '-' + process.pid);
var WORKER_ATTEMPTS;
var ADDRESS = {
	protocol: undefined,
	hostname: undefined,
	port: undefined
};

process
	.on('SIGTERM', function () {logger.error('Signal received: SIGTERM'); process.emit('cleanExit', 128 + 15);})
	.on('SIGABRT', function () {logger.error('Signal received: SIGABRT'); process.emit('cleanExit', 128 + 6);})
	.on('SIGQUIT', function () {logger.error('Signal received: SIGQUIT'); process.emit('cleanExit', 128 + 3);})
	.on('SIGINT', function () {logger.error('Signal received: SIGINT'); process.emit('cleanExit', 128 + 2);})
	.on('SIGHUP', function () {logger.error('Signal received: SIGHUP'); process.emit('cleanExit', 128 + 1);})
	.on('beforeExit', function () {logger.warn('Event loop is empty. Tavern will now close.'); process.exit(0);})
	.once('forceExit', function (exitCode) {
		preventActionForExit();
		cluster.removeAllListeners('exit');
		for (var id in cluster.workers) {
			var lastPromise = logger.warn('Force killing Worker %s.', id);
			cluster.workers[id].kill('SIGKILL');
		}
		lastPromise
			.timeout(10000)
			.catch(function ignore() {})
			.finally(process.exit.bind(null, ~~exitCode));
	})
	.once('cleanExit', function (exitCode) {
		function timeoutExit() {
			logger.warn('Clean exit timed out. Forcing exit.');
			process.emit('forceExit', exitCode);
		}
		function cleanExit() {
			logger.log('Clean exit.');
			process.exit(~~exitCode);
		}
		
		preventActionForExit();
		cluster.on('disconnect', function (worker) {
			logger.log('Worker %s has disconnected.', worker.id);
		});
		
		// Try to let workers suicide gracefully, but set a timer just in case.
		logger.log('Cleaning up...');
		cluster.disconnect();
		setTimeout(timeoutExit, 10000).unref();
		
		// It's no longer bad if the event loop is empty.
		process.removeAllListeners('beforeExit');
		process.on('beforeExit', cleanExit);
	});


cluster.setupMaster({
	exec: path.resolve(__dirname, 'worker/tavern-worker.js'),
	args: [],
	silent: false
});
cluster.on('fork', function (worker) {
	logger.log('Worker %s has been forked.', worker.id);
});
cluster.on('disconnect', function (worker) {
	logger.error('Worker %s has disconnected.', worker.id);
	setTimeout(createWorker, 1000);
});
cluster.on('exit', function (worker, exitCode, signal) {
	logger.log('Worker %s has exited.', worker.id);
});


process.once('message', function (json) {
	var options = JSON.parse(json);
	
	if (options.attach) {
		logger.writeToTerminal = true;
		process.on('disconnect', function () {
			logger.error('Tavern CLI was terminated. Tavern will now close.');
			process.emit('cleanExit');
		});
	}
	
	if (process.env.NODE_ENV === 'production') {
		init(80);
	} else {
		require('./get-available-port')(init);
	}
	
	function init(port) {
		ADDRESS.protocol = 'http';
		ADDRESS.hostname = require('./get-ipv4')();
		ADDRESS.port = port;
		
		var count = ~~options.workers || require('os').cpus().length || 1;
		WORKER_ATTEMPTS = Math.max(count + 1, 3);
		for (var i=0; i<count; i++) createWorker();
	}
});

function createWorker() {
	var worker = cluster.fork({TAVERN_PORT: ADDRESS.port});
	
	var failTimer = setTimeout(function () {
		if (!worker.isDead()) {
			logger.error('Worker %s has timed out.', worker.id);
			worker.kill('SIGKILL');
		}
		--WORKER_ATTEMPTS <= 0 && processFailed();
	}, 5000);
	failTimer.unref();
	
	worker.on('listening', function () {
		clearTimeout(failTimer);
		logger.log('Worker %s is listening on %s://%s:%d', worker.id, ADDRESS.protocol, ADDRESS.hostname, ADDRESS.port);
		processSucceeded();
	});
	
	// worker.process.stdin
	// worker.process.stdout
	// worker.process.stderr
}

function processSucceeded() {
	if (process.connected) process.send(ADDRESS);
	WORKER_ATTEMPTS = Infinity;
	processSucceeded = function () {};
}

function processFailed() {
	if (process.connected) process.send('FAIL');
	logger.log('Too many attempts to create successful workers. Forcing exit.');
	process.emit('forceExit', 1);
	processFailed = function () {};
}

function preventActionForExit() {
	// We no longer care about the CLI.
	process.removeAllListeners('disconnect');
	
	// We can no longer trigger a clean exit sequence.
	process.removeAllListeners('cleanExit');
	
	// It's okay for workers to disconnect now.
	cluster.removeAllListeners('disconnect');
	
	// We shouldn't spawn any more workers.
	createWorker = function () {};
	
	// The process can no longer fail or succeed.
	processFailed = function () {};
	processSucceeded = function () {};
	
	// We will make no more attempts to spawn workers.
	WORKER_ATTEMPTS = 0;
	
	// We no longer care if new workers are listening.
	for (var id in cluster.workers) {
		cluster.workers[id].removeAllListeners('listening');
	}
}
