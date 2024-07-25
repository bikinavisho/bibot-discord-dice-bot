const fortuneCommand = require('../../src/commands/fortune');

const {SlashCommandBuilder} = require('discord.js');

describe('fortune', () => {
	test('data is an instance of SlackCommandBuilder class', () => {
		expect(fortuneCommand.data).toBeInstanceOf(SlashCommandBuilder);
	});
	test('execute can be called without exceptions', async () => {
		const mockInteraction = {
			reply: jest.fn().mockResolvedValue({
				react: jest.fn()
			})
		};
		await expect(() => {
			fortuneCommand.execute(mockInteraction);
		}).not.toThrow();
	});
});
