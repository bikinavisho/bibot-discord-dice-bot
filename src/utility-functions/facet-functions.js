const pluralize = require('pluralize');

const {log} = require('../logging-util.js');

function determineFacetReaction(totalSuccesses) {
	if (totalSuccesses <= 0) {
		return '<:rip:752693741440991323>';
	} else if (totalSuccesses >= 5) {
		return '<a:praisethesun:681222773481537838>';
	} else {
		return '🎉';
	}
}

function evaluateFacetSuccess(sumNum, rawDiceResult) {
	let totalSuccesses = 0;

	// Determine successes based on the sumNum
	if (sumNum < 50) {
		log(`\t${sumNum} was less than 50, resulting in a Failure`);
		totalSuccesses = 0;
	} else if (sumNum < 70) {
		log(`\t${sumNum} was less than 70, resulting in 1 Success`);
		totalSuccesses = 1;
	} else if (sumNum < 90) {
		log(`\t${sumNum} was less than 90, resulting in 2 Successes`);
		totalSuccesses = 2;
	} else if (sumNum < 120) {
		log(`\t${sumNum} was less than 120, resulting in 3 Successes`);
		totalSuccesses = 3;
	} else if (sumNum < 150) {
		log(`\t${sumNum} was less than 150, resulting in 4 Successes`);
		totalSuccesses = 4;
	} else if (sumNum >= 150) {
		log(`\t${sumNum} was greater than or equal to 150, resulting in 5 Successes!`);
		totalSuccesses = 5;
	}

	// crit failures
	if (rawDiceResult === 1) {
		log(`\t${rawDiceResult} was rolled, resulting in a Critical Failure. -1 Success (and -1 star)`);
		totalSuccesses = Math.max(totalSuccesses - 1, 0);
	} else if (rawDiceResult >= 2 && rawDiceResult <= 10) {
		log(`\t${rawDiceResult} was rolled, resulting in a Slightly Critical Failure. -1 Success`);
		totalSuccesses = Math.max(totalSuccesses - 1, 0);
	}
	// crit successes
	if (rawDiceResult === 100) {
		log(`\t${rawDiceResult} was rolled, resulting in a Critical Success. +1 Success (and +1 star)`);
		totalSuccesses += 1;
	} else if (rawDiceResult >= 90 && rawDiceResult <= 99) {
		log(`\t${rawDiceResult} was rolled, resulting in a Critical Success. +1 Success`);
		totalSuccesses += 1;
	}

	return totalSuccesses;
}

function printFacetMessage(totalSuccesses) {
	if (totalSuccesses === 0) {
		return 'a Failure';
	} else {
		return `${totalSuccesses} ${pluralize('Success', totalSuccesses)}`;
	}
}

module.exports = {
	determineFacetReaction,
	evaluateFacetSuccess,
	printFacetMessage
};
