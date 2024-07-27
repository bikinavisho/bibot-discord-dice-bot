const pbtaCommand = require('../../src/commands/pbta');

const {SlashCommandBuilder} = require('discord.js');

describe('pbta', () => {
	test('data is an instance of SlackCommandBuilder class', () => {
		expect(pbtaCommand.data).toBeInstanceOf(SlashCommandBuilder);
	});
	test('execute can be called without exceptions', async () => {
		const mockInteraction = {
			member: {
				nickname: ''
			},
			user: {
				username: ''
			},
			reply: jest.fn().mockResolvedValue({
				react: jest.fn()
			}),
			options: {
				getInteger: jest.fn(),
				getString: jest.fn()
			}
		};
		await expect(() => {
			pbtaCommand.execute(mockInteraction);
		}).not.toThrow();
	});
});
