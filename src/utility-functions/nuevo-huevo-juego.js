const {log} = require('../logging-util.js');

const EVALUATION_RESULT = {
	TOTAL_FAILURE: 'TOTAL_FAILURE',
	GREAT_FAILURE: 'GREAT_FAILURE',
	FAILURE: 'FAILURE',
	PARTIAL_FAILURE: 'PARTIAL_FAILURE',
	PARTIAL_SUCCESS: 'PARTIAL_SUCCESS',
	SUCCESS: 'SUCCESS',
	DOUBLE_SUCCESS: 'DOUBLE_SUCCESS',
	TRIPLE_SUCCESS: 'TRIPLE_SUCCESS',
	QUADRUPLE_SUCCESS: 'QUADRUPLE_SUCCESS',
	GREATER_SUCCESS: 'GREATER_SUCCESS'
};

/**
 * Returns a reaction emoji or custom Discord emoji string based on the evaluation result.
 *
 * @param {EVALUATION_RESULT} evaluation - The evaluation result to determine the reaction for.
 * @returns {string} The corresponding emoji or Discord emoji string.
 */
function determineReaction(evaluation) {
	switch (evaluation) {
		case EVALUATION_RESULT.TOTAL_FAILURE:
			return '<:rip:752693741440991323>';
		case EVALUATION_RESULT.GREAT_FAILURE:
		case EVALUATION_RESULT.FAILURE:
			return '😢';
		case EVALUATION_RESULT.PARTIAL_FAILURE:
		case EVALUATION_RESULT.PARTIAL_SUCCESS:
			return '🫤';
		case EVALUATION_RESULT.SUCCESS:
		case EVALUATION_RESULT.DOUBLE_SUCCESS:
		case EVALUATION_RESULT.TRIPLE_SUCCESS:
		case EVALUATION_RESULT.QUADRUPLE_SUCCESS:
			return '🎉';
		case EVALUATION_RESULT.GREATER_SUCCESS:
			return '<a:praisethesun:681222773481537838>';
	}
}

/**
 * Evaluates the success level based on the provided sum number.
 *
 * @param {number} sumNum - The sum to evaluate for success or failure.
 * @returns {string} One of the EVALUATION_RESULT values representing the evaluation outcome.
 */
function evaluateSuccess(sumNum) {
	if (sumNum < 0) {
		log(`\t${sumNum} was less than 0, resulting in a Total Failure`);
		return EVALUATION_RESULT.TOTAL_FAILURE;
	} else if (sumNum < 10) {
		log(`\t${sumNum} was less than 10, resulting in a Great Failure`);
		return EVALUATION_RESULT.GREAT_FAILURE;
	} else if (sumNum < 30) {
		log(`\t${sumNum} was less than 30, resulting in a [normal] Failure`);
		return EVALUATION_RESULT.FAILURE;
	} else if (sumNum < 50) {
		log(`\t${sumNum} was less than 50, resulting in a Partial Failure`);
		return EVALUATION_RESULT.PARTIAL_FAILURE;
	} else if (sumNum < 80) {
		log(`\t${sumNum} was less than 80, resulting in a Partial Success`);
		return EVALUATION_RESULT.PARTIAL_SUCCESS;
	} else if (sumNum < 90) {
		log(`\t${sumNum} was less than 90, resulting in a [normal] Success`);
		return EVALUATION_RESULT.SUCCESS;
	} else if (sumNum < 100) {
		log(`\t${sumNum} was less than 100, resulting in 2 Successes`);
		return EVALUATION_RESULT.DOUBLE_SUCCESS;
	} else if (sumNum < 150) {
		log(`\t${sumNum} was less than 150, resulting in 3 Successes`);
		return EVALUATION_RESULT.TRIPLE_SUCCESS;
	} else if (sumNum < 200) {
		log(`\t${sumNum} was less than 200, resulting in 4 Successes`);
		return EVALUATION_RESULT.QUADRUPLE_SUCCESS;
	} else if (sumNum >= 200) {
		log(`\t${sumNum} was greater than or equal to 200, resulting in a Greater Success!`);
		return EVALUATION_RESULT.GREATER_SUCCESS;
	}
}

/**
 * Increments the evaluation result by a specified number of autosuccesses.
 * If the increment exceeds the available evaluation result keys, returns the highest success value.
 *
 * @param {string} evaluationResult - The current evaluation result key.
 * @param {number} incrementBy - The number of autosuccesses to apply.
 * @returns {string} The new evaluation result key after incrementing.
 */
function incrementSuccess(evaluationResult, incrementBy) {
	// if there are no autosuccesses to apply, then return the original evaluation result
	if (!incrementBy || incrementBy === 0) {
		return evaluationResult;
	}
	log(`\tapplying ${incrementBy} autosuccesses to ${evaluationResult}`);
	const EVALUATION_RESULT_KEYS = Object.keys(EVALUATION_RESULT);
	let currentIndex = EVALUATION_RESULT_KEYS.indexOf(evaluationResult);
	let newIndex = currentIndex + incrementBy;
	// if it exceeds the length of the array, then default to the top of the evaluation result
	if (newIndex > EVALUATION_RESULT_KEYS.length - 1) {
		return EVALUATION_RESULT.GREATER_SUCCESS;
	} else {
		return EVALUATION_RESULT[EVALUATION_RESULT_KEYS[newIndex]];
	}
}

/**
 * Returns a descriptive message based on the evaluation result.
 *
 * @param {EVALUATION_RESULT} evaluation - The evaluation result enum value.
 * @returns {string|undefined} A string describing the evaluation outcome, or undefined if the evaluation is not recognized.
 */
function printNuevoHuegoJuegoMessage(evaluation) {
	switch (evaluation) {
		case EVALUATION_RESULT.TOTAL_FAILURE:
			return 'a Total Failure';
		case EVALUATION_RESULT.GREAT_FAILURE:
			return 'a Great Failure';
		case EVALUATION_RESULT.FAILURE:
			return 'a Failure';
		case EVALUATION_RESULT.PARTIAL_FAILURE:
			return 'a Partial Failure';
		case EVALUATION_RESULT.PARTIAL_SUCCESS:
			return 'a Partial Success';
		case EVALUATION_RESULT.SUCCESS:
			return 'a Success';
		case EVALUATION_RESULT.DOUBLE_SUCCESS:
			return '2 Successes';
		case EVALUATION_RESULT.TRIPLE_SUCCESS:
			return '3 Successes';
		case EVALUATION_RESULT.QUADRUPLE_SUCCESS:
			return '4 Successes';
		case EVALUATION_RESULT.GREATER_SUCCESS:
			return 'a Greater Success';
	}
}

module.exports = {
	determineReaction,
	EVALUATION_RESULT,
	evaluateSuccess,
	incrementSuccess,
	printNuevoHuegoJuegoMessage
};
