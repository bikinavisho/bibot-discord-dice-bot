const {SlashCommandBuilder} = require('discord.js');

jest.mock('random-org');
const RandomOrgMock = require('random-org');

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
	test('nhj bulk rolls evaluate each result instead of crashing', async () => {
		const mockInteraction = {
			...MOCK_INTERACTION,
			reply: jest.fn().mockResolvedValue({
				react: jest.fn()
			}),
			options: {
				getSubcommand: jest.fn().mockReturnValue('nhj'),
				getInteger: jest.fn((name) => {
					if (name === 'repetitions') {
						return 2;
					}
					if (name === 'modifier') {
						return 0;
					}
					if (name === 'auto-successes') {
						return 0;
					}
					return 0;
				}),
				getString: jest.fn().mockReturnValue(null)
			}
		};

		RandomOrgMock.__getCurrentInstance().generateIntegers.mockResolvedValue({
			random: {data: [50, 80]}
		});

		await command.execute(mockInteraction);

		expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
		const replyPayload = mockInteraction.reply.mock.calls[0][0];
		const embed = replyPayload.embeds[0].data;
		expect(embed.fields).toEqual(
			expect.arrayContaining([
				{name: 'Partial Successes', value: '1', inline: true},
				{name: 'Successes (cumulative)', value: '1', inline: true}
			])
		);
	});
});
