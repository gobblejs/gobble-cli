require( 'colors' );

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
		return match.grey;
	}).replace( '◦', '◦'.green );
});
