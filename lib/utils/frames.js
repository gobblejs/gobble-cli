var chalk = require( 'chalk' );

module.exports = [
	'∙∙∙∙∙∙∙∙∙∙∙   ',
	'∙∙∙∙∙∙∙∙∙∙◦   ',
	'∙∙∙∙∙∙∙∙∙◦∙   ',
	'∙∙∙∙∙∙∙∙◦∙∙   ',
	'∙∙∙∙∙∙∙◦∙∙∙   ',
	'∙∙∙∙∙∙◦∙∙∙∙   ',
	'∙∙∙∙∙◦∙∙∙∙∙   ',
	'∙∙∙∙◦∙∙∙∙∙∙   ',
	'∙∙∙◦∙∙∙∙∙∙∙   ',
	'∙∙◦∙∙∙∙∙∙∙∙   ',
	'∙◦∙∙∙∙∙∙∙∙∙   ',
	'◦∙∙∙∙∙∙∙∙∙∙   '
].map( function ( frame ) {
	return frame.replace( /∙+/g, function ( match ) {
		return chalk.grey( match );
	}).replace( '◦', chalk.green( '◦' ) );
});
