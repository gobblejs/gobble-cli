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
		// Handle known errors
		console.log( 'yo', err.gobble );
		if ( err.gobble ) {
			if ( err.code === 'TRANSFORMATION_FAILED' ) {
				log( 'ERROR', 'GOBBLE ERROR  '.red, node.id + ' transformation failed' );

				console.log( '============'.grey );
				console.log( ( err.original.message || err.original ).trim() );
				console.log( '------------'.grey );
				console.log( 'stack trace:' );
				console.log( err.stack );
				console.log( '============\n\n'.grey );
			}
		}

		else {
			log( 'ERROR', 'GOBBLE ERROR  '.red, util.format.apply( util, arguments ) );
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
