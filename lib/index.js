#!/usr/bin/env node

var findup = require( 'findup-sync' ),
	resolve = require( 'resolve' ),
	path = require( 'path' ),
	parseOptions = require( './utils/parseOptions' ),
	serve = require( './serve' ),
	build = require( './build' ),
	help = require( './help' ),
	gobblefile,
	gobbledir,
	cwd;

require( 'colors' );

var command = parseOptions({
	p: 'port',
	h: 'help',
	f: 'force',
	e: 'env'
});

if ( command.options.help ) {
	return help( command );
}

// find nearest gobblefile
gobblefile = findup( 'gobblefile.js', { nocase: true });

if ( !gobblefile ) {
	console.log( 'You must have a gobblefile.js in your project\'s root folder in order to use gobble from the command line.\n\nSee ' + 'https://github.com/gobblejs/gobble/wiki/How-to-write-a-gobblefile'.cyan + ' for help getting started' );
	process.exit( 1 );
}

cwd = path.dirname( gobblefile );
process.chdir( cwd );

if ( !resolve.sync( 'gobble', { basedir: cwd }) ) {
	console.log( 'Could not find a local copy of gobble. You should probably install it with ' + 'npm install --save-dev gobble'.cyan );
}

gobbledir = path.join( cwd, '.gobble' );


// Execute command
if ( command.args[0] === 'build' ) {
 	process.env.GOBBLE_ENV = command.options.env || 'production';
 	return build( command, gobblefile, gobbledir );
}

if ( !command.args[0] || command.args[0] === 'serve' ) {
	return serve( command, gobblefile, gobbledir );
}

return help( command );
