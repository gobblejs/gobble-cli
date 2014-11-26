var watchOrServe = require( './watchOrServe' );

module.exports = function ( command, gobblefile, gobbledir ) {
	var dest = command._[1];

	watchOrServe( gobblefile, gobbledir, function ( node ) {
		return node.watch({
			dest: dest,
			gobbledir: gobbledir
		});
	});
};