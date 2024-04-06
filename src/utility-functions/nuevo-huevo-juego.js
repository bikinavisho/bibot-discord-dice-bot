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

function evaluateSuccess(sumNum) {
	if (sumNum < 0) {
		log(`${sumNum} was less than 0, resulting in a Total Failure`);
		return EVALUATION_RESULT.TOTAL_FAILURE;
	} else if (sumNum < 10) {
		log(`${sumNum} was less than 10, resulting in a Great Failure`);
		return EVALUATION_RESULT.GREAT_FAILURE;
	} else if (sumNum < 30) {
		log(`${sumNum} was less than 30, resulting in a [normal] Failure`);
		return EVALUATION_RESULT.FAILURE;
	} else if (sumNum < 50) {
		log(`${sumNum} was less than 50, resulting in a Partial Failure`);
		return EVALUATION_RESULT.PARTIAL_FAILURE;
	} else if (sumNum < 80) {
		log(`${sumNum} was less than 80, resulting in a Partial Success`);
		return EVALUATION_RESULT.PARTIAL_SUCCESS;
	} else if (sumNum < 90) {
		log(`${sumNum} was less than 90, resulting in a [normal] Success`);
		return EVALUATION_RESULT.SUCCESS;
	} else if (sumNum < 100) {
		log(`${sumNum} was less than 100, resulting in 2 Successes`);
		return EVALUATION_RESULT.DOUBLE_SUCCESS;
	} else if (sumNum < 150) {
		log(`${sumNum} was less than 150, resulting in 3 Successes`);
		return EVALUATION_RESULT.TRIPLE_SUCCESS;
	} else if (sumNum < 200) {
		log(`${sumNum} was less than 200, resulting in 4 Successes`);
		return EVALUATION_RESULT.QUADRUPLE_SUCCESS;
	} else if (sumNum >= 200) {
		log(`${sumNum} was greater than or equal to 200, resulting in a Greater Success!`);
		return EVALUATION_RESULT.GREATER_SUCCESS;
	}
}

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
	printNuevoHuegoJuegoMessage
};
