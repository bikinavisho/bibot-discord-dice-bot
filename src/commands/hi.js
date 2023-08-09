const { SlashCommandBuilder } = require('discord.js');
const {log} = require('../logging-util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hi')
		.setDescription('Bibot will greet you cheerfully.'),
	async execute(interaction) {
    const userAlias = interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

    await interaction.reply({content: `Hello, ${userAlias}!`, allowedMentions: { repliedUser: false }});
	},
};
