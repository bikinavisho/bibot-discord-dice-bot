const Discord = require('discord.js');

const {executeNormalDiceRoll, executeRankedSkillCheck} = require('../utility-functions/roll.js');

module.exports = {
	data: new Discord.SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls dice.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('dice')
				.setDescription('Roll one or more dice with a specified number of sides.')
				.addIntegerOption((option) =>
					option
						.setName('number_of_dice')
						.setDescription('number of dice to roll')
						.setMinValue(1)
						.setMaxValue(10000)
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('number_of_sides')
						.setDescription('number of sides on the rolled dice (e.g. 6 for a d6, etc.)')
						.setMinValue(2)
						.setMaxValue(2000000000)
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('modifier')
						.setDescription('a modifier to the overall roll, can be positive or negative')
						.setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('ranked')
				.setDescription(
					"A d100 skill check where the player uses a skill/attribute's rank to determine successes."
				)
				.addIntegerOption((option) =>
					option
						.setName('rank')
						.setDescription('the highest rank of relevant skills/attributes')
						.setMinValue(1)
						.setMaxValue(10)
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('magnitude')
						.setDescription(
							'the magnitude(s) of the skills/attributes being used, comma-dileneated (ex: 20,10)'
						)
						.setRequired(true)
				)
				.addBooleanOption((option) =>
					option
						.setName('skip150')
						.setDescription(
							'skip rolling dice corresponding to magnitude above 150, opting instead for an automatic success'
						)
						.setRequired(false)
				)
				.addIntegerOption((option) =>
					option
						.setName('auto-successes')
						.setDescription('the number of auto successes which apply to this skill check (defaults to 0)')
						.setMinValue(1)
						.setMaxValue(10)
						.setRequired(false)
				)
				.addStringOption((option) =>
					option.setName('comment').setDescription('Add a comment to your roll.').setRequired(false)
				)
		),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'ranked') {
			await executeRankedSkillCheck(interaction);
		}
		if (interaction.options.getSubcommand() === 'dice') {
			await executeNormalDiceRoll(interaction);
		}
	}
};
