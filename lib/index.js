#!/usr/bin/env node

var Liftoff = require( 'liftoff' ),
	interpret = require( 'interpret' ),
	v8flags = require ( 'v8flags' ),
	path = require( 'path' ),
	parseOptions = require( './utils/parseOptions' ),
	serve = require( './serve' ),
	build = require( './build' ),
	help = require( './help' );

require( 'colors' );

var command = parseOptions({
	p: 'port',
	h: 'help',
	f: 'force',
	e: 'env',
	v: 'version'
});

var cli = new Liftoff({
	name: 'gobble',
	extensions: interpret.jsVariants,
	nodeFlags: v8flags.fetch()
});

cli.on('require', function (name) {
	console.log( 'Requiring external module:', name.cyan );
});

cli.on('requireFail', function (name) {
	console.log( 'Failed to load external module:', name.red );
});

cli.on('respawn', function (flags, child) {
	var nodeFlags = flags.join(', ')
	var pid = String(child.pid);
	console.log('Node flags detected:', nodeFlags.cyan );
	console.log('Respawned to PID:', pid.cyan );
});

cli.launch({
	/*
	configPath: argv.gobblefile,
	cwd: argv.cwd,
	require: argv.require
	*/
}, function (env) {

	var gobbledir;

	if ( command.options.version ) {
		return console.log( require( '../package.json' ).version );
	}

	if ( command.options.help ) {
		return help( command );
	}

	if ( !env.modulePath ) {
		console.log( 'Could not find a local copy of gobble. You should probably install it with ' + 'npm install --save-dev gobble'.cyan );
		process.exit( 1 );
	}

	if ( !env.configPath ) {
		console.log( 'You must have a gobblefile.js in your project\'s root folder in order to use gobble from the command line.\n\nSee ' + 'https://github.com/gobblejs/gobble/wiki/How-to-write-a-gobblefile'.cyan + ' for help getting started' );
		process.exit( 1 );
	}

	if (process.cwd() !== env.cwd) {
		process.chdir(env.cwd);
	}

	gobbledir = path.join( process.cwd(), '.gobble' );

	// Execute command
	if ( command.args[0] === 'build' ) {
		process.env.GOBBLE_ENV = command.options.env || 'production';
		return build( command, env.configPath, gobbledir );
	}

	if ( !command.args[0] || command.args[0] === 'serve' ) {
		return serve( command, env.configPath, gobbledir );
	}

	return help( command );
});
