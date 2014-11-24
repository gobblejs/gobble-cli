module.exports = function ( command, gobblefile, gobbledir ) {
	var path = require( 'path' ),
		chalk = require( 'chalk' ),
		stevedore = require( 'stevedore' ),
		logger = require( './utils/logger' ),
		tryInstallPlugin = require( './utils/tryInstallPlugin' ),
		targetDir,
		task;

	targetDir = command._[1];
	if ( !targetDir ) {
		logger.error( 'You must specify an output folder, e.g. ' + chalk.magenta( 'gobble build dist' ) );
		process.exit( 1 );
	}

	start();

	function start () {
		try {
			delete require.cache[ gobblefile ];
			task = require( gobblefile ).build({
				dest: path.resolve( targetDir ),
				gobbledir: gobbledir,
				force: command.force
			});

			task.on( 'info',    logger.info );
			task.on( 'warning', logger.warn );
			task.on( 'error',   function ( err ) {
				if ( err.code === 'DIR_NOT_EMPTY' ) {
					logger.error( 'destination directory (%s) is not empty! Use ' + chalk.cyan( '--force' ) + ' or ' + chalk.cyan( '-f' ) + ' to continue anyway', err.path );
				} else {
					logger.error( err );
				}
			});

			task.on( 'start', function ( message ) {
				var loader = stevedore({
					message: message,
					frames: require( './utils/frames' )
				});
				task.once( 'stop', loader.stop );
			});

			task.on( 'complete', function () {
				logger.info( 'Successfully built project to ' + targetDir );
			});
		} catch ( err ) {
			if ( err.code === 'PLUGIN_NOT_FOUND' ) {
				plugin = err.plugin;
				logger.info( 'could not load %s plugin. Have you installed it? ' + chalk.cyan( 'npm install --save-dev gobble-%s' ), plugin, plugin );

				tryInstallPlugin( plugin, function ( err, result ) {
					if ( err ) {
						logger.info( 'exiting' );
						process.exit( 1 );
					}

					logger.info( 'successfully installed %s plugin', plugin );
					start();
				});
			} else {
				logger.error( err );
				process.exit( 1 );
			}
		}
	}
};
