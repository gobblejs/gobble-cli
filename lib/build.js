module.exports = function ( command, gobblefile ) {
	var logger = require( './utils/logger' ),
		dest,
		node,
		task;

	dest = command._[1];
	start();

	function start () {
		var startTime = Date.now(), err;

		try {
			delete require.cache[ gobblefile ];
			node = require( gobblefile );

			if ( !node._gobble ) {
				throw new Error( 'Did you forget to export something in your gobblefile?' );
			}

			task = node.build({
				dest: dest,
				force: command.force
			});

			task.catch( function ( err ) {
				logger.error( err );
				process.exit( 1 );
			});

			task.on( 'info',  logger.info );
			task.on( 'error', logger.error );

			task.on( 'complete', function () {
				logger.info({
					code: 'BUILD_COMPLETE',
					dest: dest,
					watch: false,
					duration: Date.now() - startTime
				});
				process.exit(0);
			});
		} catch ( e ) {
			if ( e.name !== 'GobbleError' ) {
				err = {
					name: 'GobbleError',
					code: 'STARTUP_ERROR',
					original: e
				};
			} else {
				err = e;
			}

			logger.error( err, start );
		}
	}
};
