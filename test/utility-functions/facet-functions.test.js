const facetFunctions = require('../../src/utility-functions/facet-functions.js');

describe('facet-functions.js', () => {
	describe('determineFacetReaction', () => {
		test('returns the rip reaction when total successes is zero or less', () => {
			expect(facetFunctions.determineFacetReaction(0)).toBe('<:rip:752693741440991323>');
			expect(facetFunctions.determineFacetReaction(-1)).toBe('<:rip:752693741440991323>');
		});

		test('returns the praise reaction when total successes is five or more', () => {
			expect(facetFunctions.determineFacetReaction(5)).toBe('<a:praisethesun:681222773481537838>');
			expect(facetFunctions.determineFacetReaction(10)).toBe('<a:praisethesun:681222773481537838>');
		});

		test('returns the celebration reaction for successes between one and four', () => {
			expect(facetFunctions.determineFacetReaction(1)).toBe('🎉');
			expect(facetFunctions.determineFacetReaction(2)).toBe('🎉');
			expect(facetFunctions.determineFacetReaction(3)).toBe('🎉');
			expect(facetFunctions.determineFacetReaction(4)).toBe('🎉');
		});
	});

	describe('evaluateFacetSuccess', () => {
		test('returns zero successes for a sum under 50', () => {
			expect(facetFunctions.evaluateFacetSuccess(49, 11)).toBe(0);
		});

		test('returns one success for sums from 50 up to but not including 70', () => {
			expect(facetFunctions.evaluateFacetSuccess(50, 11)).toBe(1);
			expect(facetFunctions.evaluateFacetSuccess(69, 11)).toBe(1);
		});

		test('returns two successes for sums from 70 up to but not including 90', () => {
			expect(facetFunctions.evaluateFacetSuccess(70, 11)).toBe(2);
			expect(facetFunctions.evaluateFacetSuccess(89, 11)).toBe(2);
		});

		test('returns three successes for sums from 90 up to but not including 120', () => {
			expect(facetFunctions.evaluateFacetSuccess(90, 11)).toBe(3);
			expect(facetFunctions.evaluateFacetSuccess(119, 11)).toBe(3);
		});

		test('returns four successes for sums from 120 up to but not including 150', () => {
			expect(facetFunctions.evaluateFacetSuccess(120, 11)).toBe(4);
			expect(facetFunctions.evaluateFacetSuccess(149, 11)).toBe(4);
		});

		test('returns five successes for sums of 150 or more', () => {
			expect(facetFunctions.evaluateFacetSuccess(150, 11)).toBe(5);
			expect(facetFunctions.evaluateFacetSuccess(200, 11)).toBe(5);
		});

		test('applies a critical failure penalty for a raw result of 1', () => {
			expect(facetFunctions.evaluateFacetSuccess(150, 150)).toBe(5);
			expect(facetFunctions.evaluateFacetSuccess(150, 1)).toBe(4);
		});

		test('applies a critical failure penalty for a raw result from 2 through 10', () => {
			expect(facetFunctions.evaluateFacetSuccess(70, 70)).toBe(2);
			expect(facetFunctions.evaluateFacetSuccess(70, 2)).toBe(1);
			expect(facetFunctions.evaluateFacetSuccess(80, 80)).toBe(2);
			expect(facetFunctions.evaluateFacetSuccess(80, 10)).toBe(1);
		});

		test('does not apply a critical failure penalty for raw results above 10', () => {
			expect(facetFunctions.evaluateFacetSuccess(70, 11)).toBe(2);
		});

		test('applies a critical success bonus for a raw result of 100', () => {
			expect(facetFunctions.evaluateFacetSuccess(50, 100)).toBe(2);
		});

		test('applies a critical success bonus for raw results from 90 through 99', () => {
			expect(facetFunctions.evaluateFacetSuccess(90, 95)).toBe(4);
			expect(facetFunctions.evaluateFacetSuccess(120, 99)).toBe(5);
		});
	});

	describe('printFacetMessage', () => {
		test('returns failure wording when total successes is zero', () => {
			expect(facetFunctions.printFacetMessage(0)).toBe('a Failure');
		});

		test('returns singular success wording for one success', () => {
			expect(facetFunctions.printFacetMessage(1)).toBe('1 Success');
		});

		test('returns plural success wording for multiple successes', () => {
			expect(facetFunctions.printFacetMessage(2)).toBe('2 Successes');
			expect(facetFunctions.printFacetMessage(3)).toBe('3 Successes');
		});
	});
});
