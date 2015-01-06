#!/usr/bin/env node

var Liftoff = require( 'liftoff' ),
	interpret = require( 'interpret' ),
	v8flags = require ( 'v8flags' ),
	path = require( 'path' ),
	chalk = require( 'chalk' ),
	minimist = require( 'minimist' ),
	findup = require( 'findup-sync' ),
	semver = require( 'semver' ),
	logger = require( './utils/logger' ),
	serve = require( './serve' ),
	watch = require( './watch' ),
	build = require( './build' ),
	help = require( './help' ),

	command,
	cli;

// This prevents the prompt from being cluttered up with
// the remains of a progress indicator
process.on( 'SIGINT', function () {
	process.stderr.write( '\n' );
	process.exit();
});

command = minimist( process.argv.slice( 2 ), {
	alias: {
		p: 'port',
		h: 'help',
		f: 'force',
		e: 'env',
		v: 'version'
	},
	boolean: 'h help f force v version'.split( ' ' )
});

if ( command.help ) {
	help();
}

else if ( command.version ) {
	console.log( 'gobble-cli version ' + require( '../package.json' ).version );
}

else {
	cli = new Liftoff({
		name: 'gobble',
		extensions: interpret.jsVariants,
		nodeFlags: v8flags.fetch()
	});

	cli.on( 'require', function (name) {
		console.log( 'Requiring external module:', chalk.cyan( name ) );
	});

	cli.on( 'requireFail', function (name) {
		console.log( 'Failed to load external module:', chalk.red( name ) );
	});

	cli.on( 'respawn', function (flags, child) {
		var nodeFlags = flags.join(', ');
		var pid = String(child.pid);
		console.log( 'Node flags detected:', chalk.cyan( nodeFlags ) );
		console.log( 'Respawned to PID:', chalk.cyan( pid ) );
	});

	cli.launch({
		/*
		configPath: argv.gobblefile,
		cwd: argv.cwd,
		require: argv.require
		*/
	}, function ( env ) {
		var version;

		if ( !env.modulePath ) {
			logger.error({
				name: 'GobbleError',
				code: 'MISSING_GOBBLE'
			});
			process.exit( 1 );
		}

		// Check that the locally installed gobble has the right version
		version = require( path.join( findup( 'node_modules/gobble' ), 'package.json' ) ).version;
		if ( semver.lt( version, '0.7.0' ) ) {
			logger.warn({
				code: 'OLD_GOBBLE',
				version: version
			});
		}

		if ( !env.configPath ) {
			logger.error({
				name: 'GobbleError',
				code: 'MISSING_GOBBLEFILE'
			});
		}

		if ( process.cwd() !== env.cwd ) {
			process.chdir( env.cwd );
		}

		// Execute command
		if ( command._[0] === 'build' ) {
			process.env.GOBBLE_ENV = command.env || 'production';
			process.env.GOBBLE_COMMAND = 'build';
			return build( command, env.configPath );
		}

		if ( command._[0] === 'watch' ) {
			process.env.GOBBLE_ENV = command.env || 'development';
			process.env.GOBBLE_COMMAND = 'watch';
			return watch( command, env.configPath );
		}

		if ( !command._[0] || command._[0] === 'serve' ) {
			process.env.GOBBLE_ENV = command.env || 'development';
			process.env.GOBBLE_COMMAND = 'serve';
			return serve( command, env.configPath );
		}

		return help( command );
	});
}
