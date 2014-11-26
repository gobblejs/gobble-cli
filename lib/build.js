module.exports = function ( command, gobblefile, gobbledir ) {
	var logger = require( './utils/logger' ),
		dest,
		task;

	dest = command._[1];
	start();

	function start () {
		var startTime = Date.now(), err;

		try {
			delete require.cache[ gobblefile ];
			task = require( gobblefile ).build({
				dest: dest,
				gobbledir: gobbledir,
				force: command.force
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

			logger.error( err );
		}
	}
};
