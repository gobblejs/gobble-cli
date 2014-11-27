var watchOrServe = require( './watchOrServe' );

module.exports = function ( command, gobblefile ) {
	var dest = command._[1];

	watchOrServe( gobblefile, function ( node ) {
		return node.watch({
			dest: dest
		});
	});
};