module.exports = function ( command, gobblefile, gobbledir ) {
	var path = require( 'path' ),
		chokidar = require( 'graceful-chokidar' ),
		tryInstallPlugin = require( './utils/tryInstallPlugin' ),
		logger = require( './utils/logger' ),
		stevedore = require( 'stevedore' ),
		frames = require( './utils/frames' ),
		task,
		watcher,
		port,
		resuming;

	port = command.options.port || 4567;

	resume();

	watcher = chokidar.watch( gobblefile, {
		ignoreInitial: true
	});

	watcher.on( 'change', function () {
		logger.info( 'gobblefile changed, restarting server...' );
		restart();
	});

	function restart () {
		if ( resuming ) {
			return;
		}

		if ( task ) {
			resuming = true;

			task.pause().then( function () {
				resuming = false;
				delete require.cache[ gobblefile ];
				resume();
			});
		} else {
			resume();
		}
	}

	function resume () {
		var plugin;

		try {
			node = require( gobblefile );

			if ( task ) {
				task.resume( node );
			} else {
				task = node.serve({
					port: port,
					gobbledir: gobbledir
				});

				task.on( 'info',    logger.info );
				task.on( 'warning', logger.warn );
				task.on( 'error',   logger.error );

				task.on( 'start', function ( message ) {
					var loader = stevedore({
						message: message,
						frames: frames
					});
					task.once( 'stop', loader.stop );
				});
			}
		} catch ( err ) {
			if ( err.code === 'PLUGIN_NOT_FOUND' ) {
				plugin = err.plugin;
				logger.info( 'could not load %s plugin. Have you installed it? ' + 'npm install --save-dev gobble-%s'.cyan, plugin, plugin );

				tryInstallPlugin( plugin, function ( err, result ) {
					if ( err ) {
						logger.info( 'exiting' );
						process.exit( 1 );
					}

					logger.info( 'successfully installed %s plugin', plugin );
					restart();
				});
			} else {
				logger.error( 'error in gobblefile' );
				console.trace( err );
			}
		}
	}
};