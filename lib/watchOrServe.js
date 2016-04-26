module.exports = function ( gobblefile, getTask ) {
	var pathwatcher = require( 'pathwatcher' ),
		logger = require( './utils/logger' ),
		task,
		watcher,
		resuming;

	resume();

	pathwatcher.watch( gobblefile, type => {
		if ( type === 'change' ) {
			logger.info({
				code: 'GOBBLEFILE_CHANGED'
			});
			restart();
		}
	});

	function restart () {
		if ( resuming ) {
			return;
		}

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
