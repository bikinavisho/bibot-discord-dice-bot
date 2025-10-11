const {SlashCommandBuilder} = require('discord.js');

const pbtaCommand = require('../../src/commands/pbta');
const {MOCK_INTERACTION} = require('../test-utils');

describe('pbta command', () => {
	test('data is an instance of SlackCommandBuilder class', () => {
		expect(pbtaCommand.data).toBeInstanceOf(SlashCommandBuilder);
	});
	test('execute can be called without exceptions', async () => {
		await expect(() => {
			pbtaCommand.execute(MOCK_INTERACTION);
		}).not.toThrow();
	});
});
