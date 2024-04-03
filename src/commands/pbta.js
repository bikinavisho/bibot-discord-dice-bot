const Discord = require('discord.js');

const {executePoweredByTheApocalypseSkillCheck} = require('../utility-functions/pbta.js');

module.exports = {
	data: new Discord.SlashCommandBuilder()
		.setName('pbta')
		.setDescription('Performs a skill check for Powered By The Apocalypse.')
		.addIntegerOption((option) =>
			option
				.setName('modifier')
				.setDescription('a modifier to the overall roll, can be positive or negative')
				.setRequired(false)
		),
	async execute(interaction) {
		await executePoweredByTheApocalypseSkillCheck(interaction);
	}
};
