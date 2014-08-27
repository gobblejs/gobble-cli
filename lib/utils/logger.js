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

	error: function () {
		log( 'ERROR', 'GOBBLE ERROR  '.red, util.format.apply( util, arguments ) );
	},

	// TODO reinstate logfile somehow
	save: function ( message ) {
		messages += message + '\n';
		write( config.gobbledir, 'gobble.log', messages );
	}
};

function log ( logPrefix, consolePrefix, message, data ) {
	message = interpolate( message, data || {} );

	//logger.save( ( '> ' + logPrefix + ' ' + message ).replace( /\[\d+m/g, '' ) ); // remove colors
	console.log( consolePrefix + ' ' + message );
}

function interpolate ( message, data ) {
	return message.replace( /\{([^\}]+)\}/g, function ( match, $1 ) {
		return data.hasOwnProperty( $1 ) ? data[ $1 ] : match;
	});
}

module.exports = logger;
