const {SlashCommandBuilder} = require('discord.js');

const command = require('../../src/commands/bulk');
const {MOCK_INTERACTION} = require('../test-utils');

describe('bulk', () => {
	test('data is an instance of SlashCommandBuilder class', () => {
		expect(command.data).toBeInstanceOf(SlashCommandBuilder);
	});
	test('execute can be called without exceptions', async () => {
		await expect(() => {
			command.execute(MOCK_INTERACTION);
		}).not.toThrow();
	});
});
