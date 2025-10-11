const {SlashCommandBuilder} = require('discord.js');

const fortuneCommand = require('../../src/commands/fortune');
const {MOCK_INTERACTION} = require('../test-utils');

// Use the manual mock in __mocks__/random-org.js and get its helper API
jest.mock('random-org');
const RandomOrgMock = require('random-org');

describe('fortune command', () => {
	test('data is an instance of SlackCommandBuilder class', () => {
		expect(fortuneCommand.data).toBeInstanceOf(SlashCommandBuilder);
	});
	test('execute can be called without exceptions', async () => {
		await expect(() => {
			fortuneCommand.execute(MOCK_INTERACTION);
		}).not.toThrow();
	});
	test('replies with expected value', async () => {
		let mockInteraction = {...MOCK_INTERACTION};

		RandomOrgMock.__setNextRoll(1); // set roll to 1 to get first fortune

		await fortuneCommand.execute(mockInteraction);

		expect(mockInteraction.reply).toHaveBeenCalled();
		expect(mockInteraction.reply).toHaveBeenCalledWith({
			content: '🥠 A beautiful, smart, and loving person will be coming into your life.'
		});
	});
});
