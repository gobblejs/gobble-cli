/*global console */
var util = require( 'util' ),
	messages = '',
	logger;

require( 'colors' );

logger = {
	info: function () {
		log( 'INFO', 'GOBBLE INFO   '.cyan, util.format.apply( util, arguments ) );
	},

	warn: function () {
		log( 'WARNING', 'GOBBLE WARNING'.magenta, util.format.apply( util, arguments ) );
	},

	error: function ( err ) {
		// allow error to be passed as a string
		if ( typeof err !== 'object' ) {
			log( 'ERROR', 'GOBBLE ERROR  '.red, util.format.apply( util, arguments ) );
			return;
		}

		// Handle known errors
		if ( err.gobble && err.code === 'TRANSFORMATION_FAILED' ) {
			log( 'ERROR', 'GOBBLE ERROR  '.red, node.id + ' transformation failed' );

			console.log( '============'.grey );
			console.log( ( err.original.message || err.original ).trim() );
			console.log( '------------'.grey );
			console.log( 'stack trace:' );
			console.log( err.stack );
			console.log( '============\n\n'.grey );
		}

		else {
			log( 'ERROR', 'GOBBLE ERROR  '.red, ( err.message || err ).trim() );

			console.log( '============'.grey );
			console.log( 'stack trace:' );
			console.log( err.stack );
			console.log( '============\n\n'.grey );
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
