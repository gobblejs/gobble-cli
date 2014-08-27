module.exports = function ( command, gobblefile, gobbledir ) {
	var path = require( 'path' ),
		stevedore = require( 'stevedore' ),
		logger = require( './utils/logger' ),
		targetDir,
		task;

	require( 'colors' );

	targetDir = command.args[1];
	if ( !targetDir ) {
		logger.error( 'You must specify an output folder, e.g. ' + 'gobble build dist'.magenta );
		process.exit( 1 );
	}

	try {
		task = require( gobblefile ).build({
			dest: path.resolve( targetDir ),
			gobbledir: gobbledir,
			force: command.options.force
		});
	} catch ( err ) {
		logger.error( err );
		process.exit( 1 );
	}


	task.on( 'info',    logger.info );
	task.on( 'warning', logger.warn );
	task.on( 'error',   function ( err ) {
		if ( err.code === 'DIR_NOT_EMPTY' ) {
			logger.error( 'destination directory (%s) is not empty! Use ' + '--force'.cyan + ' or ' + '-f'.cyan + ' to continue anyway', err.path );
			process.exit( 1 );
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
};
