const nuevoHuevoJuego = require('../../src/utility-functions/nuevo-huevo-juego.js');

describe('nuevo huevo juego utility functions', () => {
	describe('incrementSuccess', () => {
		test('increments success from TOTAL_FAILURE to GREAT_FAILURE', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.TOTAL_FAILURE, 1)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.GREAT_FAILURE
			);
		});
		test('increments success from GREAT_FAILURE to FAILURE', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.GREAT_FAILURE, 1)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.FAILURE
			);
		});
		test('increments success from FAILURE to PARTIAL_FAILURE', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.FAILURE, 1)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_FAILURE
			);
		});
		test('increments success from PARTIAL_FAILURE to PARTIAL_SUCCESS', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_FAILURE, 1)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_SUCCESS
			);
		});
		test('increments success from PARTIAL_SUCCESS to SUCCESS', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_SUCCESS, 1)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.SUCCESS
			);
		});
		test('increments success from SUCCESS to DOUBLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.SUCCESS, 1)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.DOUBLE_SUCCESS
			);
		});
		test('increments success from DOUBLE_SUCCESS to TRIPLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.DOUBLE_SUCCESS, 1)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.TRIPLE_SUCCESS
			);
		});
		test('increments success from TRIPLE_SUCCESS to QUADRUPLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.TRIPLE_SUCCESS, 1)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.QUADRUPLE_SUCCESS
			);
		});
		test('increments success from QUADRUPLE_SUCCESS to GREATER_SUCCESS', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.QUADRUPLE_SUCCESS, 1)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.GREATER_SUCCESS
			);
		});
		test('does not increment success from GREATER_SUCCESS', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.GREATER_SUCCESS, 1)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.GREATER_SUCCESS
			);
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.GREATER_SUCCESS, 2)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.GREATER_SUCCESS
			);
		});
		test('returns passed in evaluationResult if incrementBy is 0', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.SUCCESS, 0)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.SUCCESS
			);
		});
		test('returns passed in evaluationResult if incrementBy is not provided', () => {
			expect(nuevoHuevoJuego.incrementSuccess(nuevoHuevoJuego.EVALUATION_RESULT.SUCCESS)).toBe(
				nuevoHuevoJuego.EVALUATION_RESULT.SUCCESS
			);
		});
	});
	describe('evaluateSuccess', () => {
		test('evaluates -1 as TOTAL_FAILURE', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(-1)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.TOTAL_FAILURE);
		});
		test('evaluates 0 as GREAT_FAILURE', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(0)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.GREAT_FAILURE);
		});
		test('evaluates 9 as GREAT_FAILURE', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(9)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.GREAT_FAILURE);
		});
		test('evaluates 10 as FAILURE', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(10)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.FAILURE);
		});
		test('evaluates 29 as FAILURE', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(29)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.FAILURE);
		});
		test('evaluates 30 as PARTIAL_FAILURE', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(30)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_FAILURE);
		});
		test('evaluates 49 as PARTIAL_FAILURE', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(49)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_FAILURE);
		});
		test('evaluates 50 as PARTIAL_SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(50)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_SUCCESS);
		});
		test('evaluates 79 as PARTIAL_SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(79)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_SUCCESS);
		});
		test('evaluates 80 as SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(80)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.SUCCESS);
		});
		test('evaluates 89 as SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(89)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.SUCCESS);
		});
		test('evaluates 90 as DOUBLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(90)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.DOUBLE_SUCCESS);
		});
		test('evaluates 99 as DOUBLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(99)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.DOUBLE_SUCCESS);
		});
		test('evaluates 100 as TRIPLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(100)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.TRIPLE_SUCCESS);
		});
		test('evaluates 149 as TRIPLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(149)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.TRIPLE_SUCCESS);
		});
		test('evaluates 150 as QUADRUPLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(150)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.QUADRUPLE_SUCCESS);
		});
		test('evaluates 199 as QUADRUPLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(199)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.QUADRUPLE_SUCCESS);
		});
		test('evaluates 200 as GREATER_SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(200)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.GREATER_SUCCESS);
		});
		test('evaluates 250 as GREATER_SUCCESS', () => {
			expect(nuevoHuevoJuego.evaluateSuccess(250)).toBe(nuevoHuevoJuego.EVALUATION_RESULT.GREATER_SUCCESS);
		});
	});
	describe('determineReaction', () => {
		test('determines reaction for TOTAL_FAILURE', () => {
			expect(nuevoHuevoJuego.determineReaction(nuevoHuevoJuego.EVALUATION_RESULT.TOTAL_FAILURE)).toBe(
				'<:rip:752693741440991323>'
			);
		});
		test('determines reaction for GREAT_FAILURE', () => {
			expect(nuevoHuevoJuego.determineReaction(nuevoHuevoJuego.EVALUATION_RESULT.GREAT_FAILURE)).toBe('😢');
		});
		test('determines reaction for FAILURE', () => {
			expect(nuevoHuevoJuego.determineReaction(nuevoHuevoJuego.EVALUATION_RESULT.FAILURE)).toBe('😢');
		});
		test('determines reaction for PARTIAL_FAILURE', () => {
			expect(nuevoHuevoJuego.determineReaction(nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_FAILURE)).toBe('🫤');
		});
		test('determines reaction for PARTIAL_SUCCESS', () => {
			expect(nuevoHuevoJuego.determineReaction(nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_SUCCESS)).toBe('🫤');
		});
		test('determines reaction for SUCCESS', () => {
			expect(nuevoHuevoJuego.determineReaction(nuevoHuevoJuego.EVALUATION_RESULT.SUCCESS)).toBe('🎉');
		});
		test('determines reaction for DOUBLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.determineReaction(nuevoHuevoJuego.EVALUATION_RESULT.DOUBLE_SUCCESS)).toBe('🎉');
		});
		test('determines reaction for TRIPLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.determineReaction(nuevoHuevoJuego.EVALUATION_RESULT.TRIPLE_SUCCESS)).toBe('🎉');
		});
		test('determines reaction for QUADRUPLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.determineReaction(nuevoHuevoJuego.EVALUATION_RESULT.QUADRUPLE_SUCCESS)).toBe('🎉');
		});
		test('determines reaction for GREATER_SUCCESS', () => {
			expect(nuevoHuevoJuego.determineReaction(nuevoHuevoJuego.EVALUATION_RESULT.GREATER_SUCCESS)).toBe(
				'<a:praisethesun:681222773481537838>'
			);
		});
		test('determines reaction for unknown evaluation result as undefined', () => {
			expect(nuevoHuevoJuego.determineReaction('UNKNOWN_EVALUATION_RESULT')).toBeUndefined();
		});
	});
	describe('printNuevoHuegoJuegoMessage', () => {
		test('returns expected string for TOTAL_FAILURE', () => {
			expect(nuevoHuevoJuego.printNuevoHuegoJuegoMessage(nuevoHuevoJuego.EVALUATION_RESULT.TOTAL_FAILURE)).toBe(
				'a Total Failure'
			);
		});
		test('returns expected string for GREAT_FAILURE', () => {
			expect(nuevoHuevoJuego.printNuevoHuegoJuegoMessage(nuevoHuevoJuego.EVALUATION_RESULT.GREAT_FAILURE)).toBe(
				'a Great Failure'
			);
		});
		test('returns expected string for FAILURE', () => {
			expect(nuevoHuevoJuego.printNuevoHuegoJuegoMessage(nuevoHuevoJuego.EVALUATION_RESULT.FAILURE)).toBe(
				'a Failure'
			);
		});
		test('returns expected string for PARTIAL_FAILURE', () => {
			expect(nuevoHuevoJuego.printNuevoHuegoJuegoMessage(nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_FAILURE)).toBe(
				'a Partial Failure'
			);
		});
		test('returns expected string for PARTIAL_SUCCESS', () => {
			expect(nuevoHuevoJuego.printNuevoHuegoJuegoMessage(nuevoHuevoJuego.EVALUATION_RESULT.PARTIAL_SUCCESS)).toBe(
				'a Partial Success'
			);
		});
		test('returns expected string for SUCCESS', () => {
			expect(nuevoHuevoJuego.printNuevoHuegoJuegoMessage(nuevoHuevoJuego.EVALUATION_RESULT.SUCCESS)).toBe(
				'a Success'
			);
		});
		test('returns expected string for DOUBLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.printNuevoHuegoJuegoMessage(nuevoHuevoJuego.EVALUATION_RESULT.DOUBLE_SUCCESS)).toBe(
				'2 Successes'
			);
		});
		test('returns expected string for TRIPLE_SUCCESS', () => {
			expect(nuevoHuevoJuego.printNuevoHuegoJuegoMessage(nuevoHuevoJuego.EVALUATION_RESULT.TRIPLE_SUCCESS)).toBe(
				'3 Successes'
			);
		});
		test('returns expected string for QUADRUPLE_SUCCESS', () => {
			expect(
				nuevoHuevoJuego.printNuevoHuegoJuegoMessage(nuevoHuevoJuego.EVALUATION_RESULT.QUADRUPLE_SUCCESS)
			).toBe('4 Successes');
		});
		test('returns expected string for GREATER_SUCCESS', () => {
			expect(nuevoHuevoJuego.printNuevoHuegoJuegoMessage(nuevoHuevoJuego.EVALUATION_RESULT.GREATER_SUCCESS)).toBe(
				'a Greater Success'
			);
		});
	});
});
