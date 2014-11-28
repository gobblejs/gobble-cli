module.exports = function ( plugin, cb ) {
	var prompt = require( 'prompt' ),
		stevedore = require( 'stevedore' ),
		loader;

	prompt.start();

	prompt.message = prompt.delimiter = '';

	prompt.get({
		properties: {
			install: {
				message: 'install ' + plugin + ' plugin? [y/n]'
			}
		}
	}, function ( err, result ) {
		var child, s;

		if ( err ) {
			return cb( err );
		}

		if ( !result ) {
			console.log( '' );
		}

		if ( !result || !/^y/i.test( result.install ) ) {
			return cb({ name: 'GobbleError', code: 'PLUGIN_CANCELLED' });
		}

		child = require( 'child_process' ).exec( 'npm install --save-dev gobble-' + plugin, function ( err ) {
			loader.stop();

			if ( err && /404 Not Found/.test( err ) ) {
				err = { name: 'GobbleError', code: 'PLUGIN_NOT_FOUND' };
			}

			cb( err );
		});

		loader = stevedore({
			message: 'installing gobble-' + plugin + '...',
			frames: require( './frames' )
		});
	});
};
