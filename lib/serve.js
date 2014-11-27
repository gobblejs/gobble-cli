var watchOrServe = require( './watchOrServe' );

module.exports = function ( command, gobblefile ) {
	var port = command.port || 4567;

	watchOrServe( gobblefile, function ( node ) {
		return node.serve({
			port: port
		});
	});
};
