module.exports = function ( gobblefile, getTask ) {
	var chokidar = require( 'chokidar' ),
		logger = require( './utils/logger' ),
		task,
		watcher,
		resuming;

	resume();

	chokidar.watch( gobblefile ).on( 'change', restart );

	function restart () {
		if ( resuming ) return;

		logger.info({ code: 'GOBBLEFILE_CHANGED' });

		process.env.GOBBLE_RESET_UID = 'reset';

		if ( task ) {
			resuming = true;

			task.pause().then( function () {
				resuming = false;
				delete require.cache[ gobblefile ];
				resume();
			});
		} else {
			resume();
		}
	}

	function resume () {
		var node, err;

		try {
			node = require( gobblefile );

			if ( !node._gobble ) {
				throw new Error( 'Did you forget to export something in your gobblefile?' );
			}

			if ( task ) {
				task.resume( node );
			} else {
				task = getTask( node );

				task.on( 'info',  logger.info );
				task.on( 'error', logger.error );
			}
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

			logger.error( err, restart );
		}
	}
};
