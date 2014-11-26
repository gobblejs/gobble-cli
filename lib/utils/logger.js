/*global console */
var util = require( 'util' ),
	f = util.format,
	chalk = require( 'chalk' ),
	stevedore = require( 'stevedore' ),
	frames = require( './frames' ),
	summariseChanges = require( './summariseChanges' ),
	tryInstallPlugin = require( './tryInstallPlugin' ),
	messages = '',
	logger,
	messages,
	errorHandlers,
	progressIndicator,

	GOBBLE_INFO    = chalk.cyan( '[GOBBLE]' ) + ' ',
	GOBBLE_ERROR   = chalk.bgRed.white( '[GOBBLE]' ) + ' ';

messages = {
	BUILD_INVALIDATED: function ( x ) {
		return f( 'build invalidated (%s). restarting', summariseChanges( x.changes ) );
	},

	BUILD_START: function () {
		return 'build started';
	},

	BUILD_COMPLETE: function ( x ) {
		var result = ( x.dest ? 'built to ' + chalk.bold( x.dest ) : 'build completed' ) + ' in ' + chalk.bold( x.duration + 'ms' );

		if ( x.watch ) {
			result += '. Listening for changes...\n';
		}

		return result;
	},

	GOBBLEFILE_CHANGED: function () {
		return 'gobblefile changed. restarting server';
	},

	MERGE_START: function ( x ) {
		return f( '%s running...', x.id );
	},

	MERGE_COMPLETE: function ( x ) {
		return f( '%s completed in %sms', x.id, x.duration );
	},

	LIVERELOAD_RUNNING: function () {
		return 'livereload server running';
	},

	SERVER_LISTENING: function ( x ) {
		return 'server listening on port ' + chalk.bold( x.port );
	},

	TRANSFORM_START: function ( x ) {
		return chalk.bold( x.id ) + ' transformation running...';
	},

	TRANSFORM_COMPLETE: function ( x ) {
		return x.id + ' transformation completed in ' + chalk.bold( x.duration + 'ms' );
	}
};

errorHandlers = {
	DIR_NOT_EMPTY: function ( err ) {
		console.log( GOBBLE_ERROR + 'destination directory (' + err.path + ') is not empty! Use ' + chalk.cyan( '--force' ) + ' or ' + chalk.cyan( '-f' ) + ' to continue anyway' );
		return true;
	},

	MISSING_DEST_DIR: function ( err ) {
		console.log( GOBBLE_ERROR + 'you must specify a destination directory, e.g. ' + chalk.cyan( 'gobble ' + err.task + ' public' ) + ', where \'public\' is the target directory' );
		return true;
	},

	MISSING_DIRECTORY: function ( err ) {
		console.log( GOBBLE_ERROR + 'The ' + chalk.cyan( err.path ) + ' directory does not exist!' );
	},

	PLUGIN_NOT_FOUND: function ( err ) {
		var plugin = err.plugin;

		console.log( GOBBLE_INFO + 'could not load ' + plugin + ' plugin. Have you installed it? ' + chalk.cyan( 'npm install --save-dev gobble-' + plugin ) );

		tryInstallPlugin( plugin, function ( err ) {
			if ( err ) {
				logger.info( 'exiting' );
				process.exit( 1 );
			}

			console.log( GOBBLE_INFO + 'successfully installed ' + plugin + ' plugin' );
			restart();
		});
	},

	PORT_IN_USE: function ( err ) {
		console.log( GOBBLE_ERROR + 'port ' + err.port + ' is already in use. Are you already running gobble? You can specify a different port with e.g. ' + chalk.cyan( 'gobble -p 5678' ) );
		return true; // fatal
	},

	STARTUP_ERROR: function ( err ) {
		console.log( GOBBLE_ERROR + 'error starting gobble' );

		console.log( chalk.red( '>>>' ) );
		console.log( ( err.original.message || err.original ).trim() );
		console.log( chalk.grey( err.original.stack ) );
		console.log( chalk.red( '<<<' ) );

		return true; // fatal
	},

	TRANSFORMATION_FAILED: function ( err ) {
		console.log( GOBBLE_ERROR + err.id + ' transformation failed\n' );

		console.log( chalk.red( '>>>' ) );
		console.log( ( err.original.message || err.original ).trim() );
		console.log( chalk.grey( err.stack ) );
		console.log( chalk.red( '<<<' ) );
	}
};

logger = {
	info: function ( details ) {
		var fn, message;

		if ( progressIndicator ) {
			progressIndicator.stop();
			progressIndicator = null;
		}

		if ( fn = messages[ details.code ] ) {
			message = fn( details );
		} else {
			console.log( details );
			throw new Error( 'gobble-cli received an unexpected message' );
		}

		if ( details.progressIndicator ) {
			progressIndicator = stevedore({
				message: message,
				frames: frames
			});
		} else {
			console.log( GOBBLE_INFO + message );
		}
	},

	error: function ( err ) {
		var errorHandler, fatal;

		if ( progressIndicator ) {
			progressIndicator.stop();
			progressIndicator = null;
		}

		console.log( '' ); // newline

		// allow error to be passed as a string
		if ( typeof err !== 'object' ) {
			console.log( GOBBLE_ERROR + util.format.apply( util, arguments ) );
			return;
		}

		// Handle known errors
		// TODO err.gobble is deprecated in favour of err.name === 'GobbleError'
		if ( err.name === 'GobbleError' && ( errorHandler = errorHandlers[ err.code ] ) ) {
			fatal = errorHandler( err );
		}

		else {
			console.log( GOBBLE_ERROR + ( err.message || err ).trim() );

			console.log( chalk.red( '>>>' ) );
			console.log( chalk.grey( err.stack ) );
			console.log( chalk.red( '<<<' ) );

			fatal = true;
		}

		console.log( '' ); // newline

		if ( !fatal ) {
			console.log( GOBBLE_INFO + 'listening for changes...\n' );
		}
	}
};

module.exports = logger;
