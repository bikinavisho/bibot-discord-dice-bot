const {SlashCommandBuilder} = require('discord.js');

const command = require('../../src/commands/bing');

describe('bing', () => {
	test('data is an instance of SlashCommandBuilder class', () => {
		expect(command.data).toBeInstanceOf(SlashCommandBuilder);
	});

	test('execute does not throw', async () => {
		const interaction = {
			member: {nickname: 'regular-user'},
			user: {username: 'regular-user'},
			reply: jest.fn().mockResolvedValue(undefined),
			followUp: jest.fn().mockResolvedValue(undefined)
		};

		await expect(command.execute(interaction)).resolves.toBeUndefined();
	});

	test.each([
		{nickname: 'Steven', username: 'regular-user', followUp: 'Are you happy now Steven?'},
		{nickname: 'Steve', username: 'regular-user', followUp: 'Are you happy now Steve?'},
		{nickname: 'regular-user', username: '.adict', followUp: 'Are you happy now Steve?'},
		{nickname: undefined, username: 'Steven', followUp: 'Are you happy now Steven?'},
		{nickname: 'regular-user', username: 'regular-user'}
	])('replies to $username and handles nickname $nickname', async ({nickname, username, followUp}) => {
		const interaction = {
			member: nickname ? {nickname} : null,
			user: {username},
			reply: jest.fn().mockResolvedValue(undefined),
			followUp: jest.fn().mockResolvedValue(undefined)
		};

		await command.execute(interaction);

		expect(interaction.reply).toHaveBeenCalledTimes(1);
		expect(interaction.reply).toHaveBeenCalledWith('bong');
		if (followUp) {
			expect(interaction.followUp).toHaveBeenCalledTimes(1);
			expect(interaction.followUp).toHaveBeenCalledWith(followUp);
		} else {
			expect(interaction.followUp).not.toHaveBeenCalled();
		}
	});
});
