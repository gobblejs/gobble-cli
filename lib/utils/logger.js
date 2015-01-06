/*global console */
var util = require( 'util' ),
	f = util.format,
	chalk = require( 'chalk' ),
	stevedore = require( 'stevedore' ),
	ansiRegex = require( 'ansi-regex' ),
	sorcery = require( 'sorcery' ),
	frames = require( './frames' ),
	frameLength = plainText( frames[0] ).length,
	summariseChanges = require( './summariseChanges' ),
	tryInstallPlugin = require( './tryInstallPlugin' ),
	getSyntaxErrorBlock = require( './getSyntaxErrorBlock' ),
	messages = '',
	logger,
	messages,
	warnings,
	alreadyWarned = {},
	errorHandlers,
	progressIndicator,

	GOBBLE_INFO    = chalk.cyan( 'gobble:' ) + ' ',
	GOBBLE_ERROR   = chalk.bgRed.white( 'gobble:' ) + ' ',
	GOBBLE_WARNING = chalk.bgYellow.black( 'gobble:' ) + ' ';

function info ( message ) {
	write( GOBBLE_INFO + indent( message, 8 ) );
}

function warn ( message ) {
	write( GOBBLE_WARNING + indent( message, 8 ) );
}

function error ( message ) {
	write( GOBBLE_ERROR + indent( message, 8 ) );
}

function indent ( str, indentAmount ) {
	var numColumns, words, indentStr, lines = [], currentLine;

	if ( !process.stderr.isTTY ) {
		return str;
	}

	numColumns = process.stderr.columns - indentAmount;
	indentStr = new Array( indentAmount + 1 ).join( ' ' );

	words = str.split( ' ' );
	currentLine = words.shift();

	words.forEach( function ( word ) {
		if ( ( plainText( currentLine ).length + plainText( word ).length + 1 ) < numColumns ) {
			currentLine += ' ' + word;
		} else {
			currentLine += new Array( numColumns - currentLine.length ).join( ' ' );
			currentLine += '\n';
			lines.push( currentLine );
			currentLine = word;
		}
	});

	currentLine += new Array( numColumns - currentLine.length ).join( ' ' );
	lines.push( currentLine );

	return lines.join( indentStr );
}

function clearLineAfter ( offset, text ) {
	var cols;

	if ( !process.stderr.isTTY ) {
		return text;
	}

	cols = process.stderr.columns - ( offset + text.length );

	if ( cols > 0 ) {
		return text + new Array( cols ).join( ' ' );
	} else {
		return text.substring( 0, process.stderr.columns - offset - 1 );
	}
}

function plainText ( str ) {
	// strip control codes
	return str.replace( ansiRegex(), '' );
}

function write ( message ) {
	process.stderr.write( message + '\n' );
}

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
		return chalk.bold( x.id ) + ' running...';
	},

	MERGE_COMPLETE: function ( x ) {
		return x.id + ' done in ' + chalk.bold( x.duration + 'ms' );
	},

	LIVERELOAD_RUNNING: function () {
		return 'livereload server running';
	},

	SERVER_LISTENING: function ( x ) {
		return 'server listening on port ' + chalk.bold( x.port );
	},

	TRANSFORM_START: function ( x ) {
		return chalk.bold( x.id ) + ' running...';
	},

	TRANSFORM_COMPLETE: function ( x ) {
		return x.id + ' done in ' + chalk.bold( x.duration + 'ms' );
	}
};

warnings = {
	OLD_GOBBLE: function ( x ) {
		return 'Your locally installed gobble version (' + chalk.bold( x.version ) + ') is out of date, and may cause problems with gobble-cli. You should update with ' + chalk.cyan( 'npm update gobble' );
	},

	MAP_DEPRECATED: function () {
		return 'node.map() is deprecated. You should use node.transform() instead for both file and directory transforms';
	}
};

errorHandlers = {
	DIR_NOT_EMPTY: function ( err ) {
		error( 'destination directory (' + err.path + ') is not empty! Use ' + chalk.cyan( '--force' ) + ' or ' + chalk.cyan( '-f' ) + ' to continue anyway' );
		return true;
	},

	MISSING_DEST_DIR: function ( err ) {
		error( 'you must specify a destination directory, e.g. ' + chalk.cyan( 'gobble ' + err.task + ' public' ) + ', where \'public\' is the target directory' );
		return true;
	},

	MISSING_DIRECTORY: function ( err ) {
		error( 'the ' + chalk.cyan( err.path ) + ' directory does not exist!' );
	},

	MISSING_GOBBLE: function () {
		error( 'could not find a local copy of gobble. You should probably install it with ' + chalk.cyan( 'npm install --save-dev gobble' ) );
		return true;
	},

	MISSING_GOBBLEFILE: function () {
		error( 'You must have a gobblefile.js in your project\'s root folder in order to use gobble from the command line.\n\nSee ' + chalk.cyan( 'https://github.com/gobblejs/gobble/wiki/How-to-write-a-gobblefile' ) + ' for help getting started' );
		return true;
	},

	PLUGIN_NOT_FOUND: function ( err, cb ) {
		var plugin = err.plugin;

		info( 'could not load ' + plugin + ' plugin. Have you installed it? ' + chalk.cyan( 'npm install --save-dev gobble-' + plugin ) );

		tryInstallPlugin( plugin, function ( err ) {
			if ( err ) {
				process.stderr.write( '\n' );
				if ( err.name === 'GobbleError' ) {
					if ( err.code === 'PLUGIN_CANCELLED' ) {
						info( 'aborted plugin installation' );
					} else if ( err.code === 'PLUGIN_NOT_FOUND' ) {
						error( 'gobble-' + plugin + ' does not exist on npm' );
					}

					process.exit( 1 );
				} else {
					info( 'installation failed' );
					throw err;
				}
			}

			info( 'successfully installed ' + plugin + ' plugin' );
			cb();
		});

		return true;
	},

	PORT_IN_USE: function ( err ) {
		error( 'port ' + err.port + ' is already in use. Are you already running gobble? You can specify a different port with e.g. ' + chalk.cyan( 'gobble -p 5678' ) );
		return true; // fatal
	},

	STARTUP_ERROR: function ( err ) {
		error( 'error starting gobble' );

		console.error( chalk.red( '>>>' ) );
		console.error( ( err.original.message || err.original ).trim() );
		console.error( chalk.grey( err.original.stack ) );
		console.error( chalk.red( '<<<' ) );

		return true; // fatal
	},

	TRANSFORMATION_FAILED: function ( err ) {
		var chain, loc;

		error( err.id + ' transformation failed\n' );

		console.error( chalk.red( '>>>' ) );

		if ( err.file ) {
			console.error( chalk.grey( '===' ) );
			console.error( err.file );

			if ( err.line ) {
				console.error( chalk.grey( '---' ) );
				console.error( getSyntaxErrorBlock( err.file, err.line, err.column ) );

				try {
					chain = sorcery.loadSync( err.file );
					loc = chain.trace( err.line, err.column );

					if ( loc && loc.source !== err.file ) {
						console.error( chalk.grey( '===' ) );
						console.error( 'original error in ' + loc.source + ' (best guess)' );
						console.error( chalk.grey( '---' ) );
						console.error( getSyntaxErrorBlock( loc.source, loc.line, loc.column ) );

					}
				} catch ( err ) {
					// do nothing - this is best effort only
				}
			}

			console.error( chalk.grey( '===' ) );
		}

		console.error( ( err.original.message || err.original ).trim() );
		console.error( chalk.grey( err.stack ) );
		console.error( chalk.red( '<<<' ) );
	}
};

logger = {
	info: function ( details ) {
		var fn, message, args;

		if ( progressIndicator ) {
			progressIndicator.stop();
			progressIndicator = null;
		}

		if ( fn = messages[ details.code ] ) {
			message = fn( details );
		} else if ( typeof details.message === 'string' ) {
			args = [ details.message ];
			if ( details.parameters ) {
				args = args.concat( details.parameters );
			}
			message = util.format.apply( null, args );
		} else {
			message = util.format.apply( null, arguments );
		}

		if ( details.progressIndicator ) {
			message = clearLineAfter( frameLength, message );
			progressIndicator = stevedore({
				message: message,
				frames: frames
			});
		} else {
			info( message );
		}
	},

	error: function ( err, cb ) {
		var errorHandler, fatal;

		if ( progressIndicator ) {
			progressIndicator.stop();
			progressIndicator = null;
		}

		process.stderr.write( '\n' ); // newline

		// allow error to be passed as a string
		if ( typeof err !== 'object' ) {
			error( util.format.apply( util, arguments ) );
			return;
		}

		// Handle known errors
		// TODO err.gobble is deprecated in favour of err.name === 'GobbleError'
		if ( err.name === 'GobbleError' && ( errorHandler = errorHandlers[ err.code ] ) ) {
			fatal = errorHandler( err, cb ) || !cb;
		}

		else {
			error( ( err.message || err ).trim() );

			console.log( chalk.red( '>>>' ) );
			console.log( chalk.grey( err.stack ) );
			console.log( chalk.red( '<<<' ) );

			fatal = true;
		}

		console.log( '' ); // newline

		if ( !fatal ) {
			info( 'listening for changes...\n' );
		}
	},

	warn: function ( details ) {
		var fn, message;

		if ( fn = warnings[ details.code ] ) {
			message = fn( details );
		} else {
			throw new Error( 'gobble-cli received an unexpected warning: ' + util.format.apply( null, arguments ) );
		}

		if ( !alreadyWarned[ message ] ) {
			warn( message );
		}
	}
};

module.exports = logger;
