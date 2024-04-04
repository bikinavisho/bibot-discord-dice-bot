const Discord = require('discord.js');

const {
	executeNormalDiceRoll,
	executeRankedSkillCheck,
	executeNuevoHuevoJuegoDiceRoll
} = require('../utility-functions/roll.js');

const COMMAND_NAME_DICE = 'dice';
const COMMAND_NAME_RANKED = 'ranked';
const COMMAND_NAME_NUEVO_HUEVO_JUEGO = 'nhj';

module.exports = {
	data: new Discord.SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls dice.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName(COMMAND_NAME_DICE)
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
				.setName(COMMAND_NAME_NUEVO_HUEVO_JUEGO)
				.setDescription("Rolls 1d100 and determines success according to Hunter's 2024 campaign system rules.")
				.addIntegerOption((option) =>
					option
						.setName('modifier')
						.setDescription('a modifier to the overall roll, can be positive or negative')
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('greater_successes')
						.setDescription('the number of greater successes that your character can add to this roll')
						.setRequired(false)
				)
				.addStringOption((option) =>
					option.setName('comment').setDescription('Add a comment to your roll.').setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(COMMAND_NAME_RANKED)
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
		if (interaction.options.getSubcommand() === COMMAND_NAME_RANKED) {
			await executeRankedSkillCheck(interaction);
		}
		if (interaction.options.getSubcommand() === COMMAND_NAME_NUEVO_HUEVO_JUEGO) {
			await executeNuevoHuevoJuegoDiceRoll(interaction);
		}
		if (interaction.options.getSubcommand() === COMMAND_NAME_DICE) {
			await executeNormalDiceRoll(interaction);
		}
	}
};
