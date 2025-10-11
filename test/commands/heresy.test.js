const {SlashCommandBuilder} = require('discord.js');
const {faker} = require('@faker-js/faker');

const heresyCommand = require('../../src/commands/heresy');
const {MOCK_INTERACTION} = require('../test-utils');

// Use the manual mock in __mocks__/random-org.js and get its helper API
jest.mock('random-org');
const RandomOrgMock = require('random-org');

describe('heresy command', () => {
	test('data is an instance of SlackCommandBuilder class', () => {
		expect(heresyCommand.data).toBeInstanceOf(SlashCommandBuilder);
	});
	test('execute can be called without exceptions', async () => {
		await expect(() => {
			heresyCommand.execute(MOCK_INTERACTION);
		}).not.toThrow();
	});

	describe('roll evaluations', () => {
		describe('replies with SUCCESS', () => {
			test('when roll is lower than target', async () => {
				const returnedReply = await runHeresyWithRoll(2, 99);
				expect(returnedReply.content).toContain('rolled: `1d100` = `2`');
				expect(returnedReply.content).toMatch(/SUCCESS/);
			});
			test('when roll is 1 (automatic success)', async () => {
				const returnedReply = await runHeresyWithRoll(1, -100);
				expect(returnedReply.content).toContain('rolled: `1d100` = `1`');
				expect(returnedReply.content).toMatch(/SUCCESS/);
			});
			test('when roll is equal to target', async () => {
				const returnedReply = await runHeresyWithRoll(66, 66);
				expect(returnedReply.content).toContain('rolled: `1d100` = `66`');
				expect(returnedReply.content).toMatch(/SUCCESS/);
			});
			test('when roll is equal to target + modifier', async () => {
				const returnedReply = await runHeresyWithRoll(50, 45, 5);
				expect(returnedReply.content).toContain('rolled: `1d100` = `50`');
				expect(returnedReply.content).toMatch(/SUCCESS/);
			});
			test('when roll is lower than target + modifier', async () => {
				const returnedReply = await runHeresyWithRoll(50, 55, -5);
				expect(returnedReply.content).toContain('rolled: `1d100` = `50`');
				expect(returnedReply.content).toMatch(/SUCCESS/);
			});
		});
		describe('replies with FAILURE', () => {
			test('when roll is higher than target', async () => {
				const returnedReply = await runHeresyWithRoll(99, 1);
				expect(returnedReply.content).toContain('rolled: `1d100` = `99`');
				expect(returnedReply.content).toMatch(/FAILURE/);
			});
			test('when roll is 100 (automatic failure)', async () => {
				const returnedReply = await runHeresyWithRoll(100, 101);
				expect(returnedReply.content).toContain('rolled: `1d100` = `100`');
				expect(returnedReply.content).toMatch(/FAILURE/);
			});
		});
	});

	describe('replies with correct degrees of success', () => {
		test('when the target and roll are equal', async () => {
			const returnedReply = await runHeresyWithRoll(66, 66);
			expect(returnedReply.content).toContain('with 1 degree of success!');
		});

		[10, 20, 30, 40, 50, 60, 70, 80, 90].forEach((diff, i) => {
			test(`for a difference of ${diff}, it is ${i + 2} degrees of success`, async () => {
				const roll = 2; // roll 2 so it will always succeed
				const target = diff;
				const returnedReply = await runHeresyWithRoll(roll, target);
				expect(returnedReply.content).toContain(`with ${i + 2} degrees of success!`);
			});

			test(`for a difference of ${i + 1}X, it is ${i + 2} degrees of success`, async () => {
				const roll = 2; // roll 2 so it will always succeed
				const target = diff + faker.number.int({min: 1, max: 9}); // target + modifier
				const returnedReply = await runHeresyWithRoll(roll, target);
				expect(returnedReply.content).toContain(`with ${i + 2} degrees of success!`);
			});
		});
	});

	describe('replies with correct degrees of failure', () => {
		test('for a difference less than 10, it is one degree of failure', async () => {
			const roll = faker.number.int({min: 2, max: 9});
			const target = 1; // set target to 1 so it will always fail
			const returnedReply = await runHeresyWithRoll(roll, target);
			expect(returnedReply.content).toContain('with 1 degree of failure!');
		});

		[10, 20, 30, 40, 50, 60, 70, 80, 90].forEach((diff, i) => {
			test(`for a difference of ${diff}, it is ${i + 2} degrees of failure`, async () => {
				const roll = diff;
				const target = 1; // set target to 1 so it will always fail
				const returnedReply = await runHeresyWithRoll(roll, target);
				expect(returnedReply.content).toContain(`with ${i + 2} degrees of failure!`);
			});

			test(`for a difference of ${i + 1}X, it is ${i + 2} degrees of failure`, async () => {
				const roll = diff + faker.number.int({min: 1, max: 9});
				const target = 1; // set target to 1 so it will always fail
				const returnedReply = await runHeresyWithRoll(roll, target);
				expect(returnedReply.content).toContain(`with ${i + 2} degrees of failure!`);
			});
		});
	});
});

// Small test helpers to reduce code duplication
function makeMockInteraction(target = 50, modifier = 0) {
	const mockInteraction = {...MOCK_INTERACTION};
	mockInteraction.options = {
		getInteger: jest.fn((name) => {
			if (name === 'target') return target;
			if (name === 'modifier') return modifier;
			return undefined;
		})
	};
	return mockInteraction;
}

async function runHeresyWithRoll(roll, target = 50, modifier = 0) {
	const mockInteraction = makeMockInteraction(target, modifier);
	RandomOrgMock.__setNextRoll(roll);
	await heresyCommand.execute(mockInteraction);
	return mockInteraction.reply.mock.calls[0][0];
}
