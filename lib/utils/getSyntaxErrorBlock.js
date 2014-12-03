var fs = require( 'fs' ),
	chalk = require( 'chalk' );

module.exports = function getSyntaxErrorBlock ( file, line, column ) {
	var buffer = 2, code, lines, start, end, numDigits;

	line -= 1; // zero base

	start = Math.max( 0, line - buffer );
	end = line + buffer;

	numDigits = String( line + buffer ).length;

	code = fs.readFileSync( file, 'utf-8' );
	lines = code.split( '\n' ).slice( start, end + 1 );

	lines = lines.map( function ( str, i ) {
		var lineNum = start + i;

		if ( lineNum === line ) {
			if ( column !== undefined ) {
				str = str.substr( 0, column ) + chalk.inverse( str[ column ] ) + str.substring( column + 1 );
			}

			str = chalk.red( str );
		}

		return pad( lineNum + 1, numDigits ) + ': ' + str;
	});

	return lines.join( '\n' );
};

function pad ( num, digits ) {
	num = String( num );

	while ( num.length < digits ) {
		num = ' ' + num;
	}

	return num;
}