module.exports = function ( options ) {
	var fs = require( 'fs' ),
		path = require( 'path' );

	fs.readFile( path.join( __dirname, 'help.md' ), 'utf-8', function ( err, result ) {
		if ( err ) throw err;
		console.log( result.replace( '<%= version %>', require( '../package.json' ).version ) );
	});
};
