const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bing')
		.setDescription('Replies with Bong!'),
	async execute(interaction) {
    const userAlias = interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

    await interaction.reply('bong');
    if (_.includes(userAlias, "Steven")) {
			await interaction.followUp("Are you happy now Steven?")
    } else if (_.includes(userAlias, "Steve")) {
			await interaction.followUp("Are you happy now Steve?")
    } else if (interaction.user?.username === ".adict") {
			await interaction.followUp("Are you happy now Steve?")
    }
	},
};
