const {SlashCommandBuilder} = require('discord.js');

const fortuneCommand = require('../../src/commands/fortune');
const {MOCK_INTERACTION} = require('../test-utils');

describe('fortune', () => {
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

		await fortuneCommand.execute(mockInteraction);

		expect(mockInteraction.reply).toHaveBeenCalled();
		expect(mockInteraction.reply).toHaveBeenCalledWith({
			content: '🥠 A beautiful, smart, and loving person will be coming into your life.'
		});
	});
});
