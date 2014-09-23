/*global console */
var util = require( 'util' ),
	chalk = require( 'chalk' ),
	messages = '',
	logger;

require( 'colors' );

logger = {
	info: function () {
		log( 'INFO', chalk.cyan( 'GOBBLE INFO   ' ), util.format.apply( util, arguments ) );
	},

	warn: function () {
		log( 'WARNING', chalk.magenta( 'GOBBLE WARNING' ), util.format.apply( util, arguments ) );
	},

	error: function ( err ) {
		// allow error to be passed as a string
		if ( typeof err !== 'object' ) {
			log( 'ERROR', chalk.red( 'GOBBLE ERROR  ' ), util.format.apply( util, arguments ) );
			return;
		}

		// Handle known errors
		if ( err.gobble && err.code === 'TRANSFORMATION_FAILED' ) {
			log( 'ERROR', chalk.red( 'GOBBLE ERROR  ' ), node.id + ' transformation failed' );

			console.log( chalk.grey( '============' ) );
			console.log( ( err.original.message || err.original ).trim() );
			console.log( chalk.grey( '------------' ) );
			console.log( 'stack trace:' );
			console.log( err.stack );
			console.log( chalk.grey( '============\n\n' ) );
		}

		else if ( err.code === 'PORT_IN_USE' ) {
			log( 'ERROR', chalk.red( 'GOBBLE ERROR  ' ), 'port ' + err.port + ' is already in use. Are you already running gobble? You can specify a different port with e.g. ' + chalk.cyan( 'gobble -p 5678' ) );
		}

		else {
			log( 'ERROR', chalk.red( 'GOBBLE ERROR  ' ), ( err.message || err ).trim() );

			console.log( chalk.grey( '============' ) );
			console.log( 'stack trace:' );
			console.log( err.stack );
			console.log( chalk.grey( '============\n\n' ) );
		}
	},

	// TODO reinstate logfile somehow
	save: function ( message ) {
		messages += message + '\n';
		write( config.gobbledir, 'gobble.log', messages );
	}
};

function log ( logPrefix, consolePrefix, message ) {
	//logger.save( ( '> ' + logPrefix + ' ' + message ).replace( /\[\d+m/g, '' ) ); // remove colors
	console.log( consolePrefix + ' ' + message );
}

module.exports = logger;
