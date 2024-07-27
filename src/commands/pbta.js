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
		)
		.addStringOption((option) =>
			option.setName('comment').setDescription('Add a comment to your roll.').setRequired(false)
		),
	async execute(interaction) {
		await executePoweredByTheApocalypseSkillCheck(interaction);
	}
};
