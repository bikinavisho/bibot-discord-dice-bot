const {SlashCommandBuilder} = require('discord.js');
const RandomOrg = require('random-org');
const pluralize = require('pluralize');

const {log} = require('../logging-util.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({apiKey: process.env.RANDOM_API_KEY});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('heresy')
		.setDescription('Performs a skill check for Dark Heresy.')
		.addIntegerOption((option) =>
			option
				.setName('target')
				.setDescription('the target you are trying to roll under to succeed')
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName('modifier')
				.setDescription('a modifier to the target, can be positive or negative')
				.setRequired(false)
		),
	async execute(interaction) {
		const userAlias =
			interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

		let target = interaction.options.getInteger('target');
		let modifier = interaction.options.getInteger('modifier') ?? 0;

		log(`rolling 1d100, aiming for below ${target} with target modifier ${modifier}`);
		let randomConfig = {
			min: 1,
			max: 100,
			n: 1
		};
		await random.generateIntegers(randomConfig).then(async (result) => {
			let rolledNumber = result?.random?.data?.[0];

			let messageContent = `${userAlias} rolled: \`1d100\` = \`${rolledNumber}\`. (Target: ${target + modifier})\n`;
			messageContent += '\tthus resulting in ';

			let isSuccess = Boolean(rolledNumber <= target + modifier);

			// Handle critical success/failure scenarios
			if (rolledNumber === 1 || rolledNumber === 100) {
				if (rolledNumber === 1) {
					isSuccess = true;
					messageContent += 'a CRITICAL SUCCESS!';
				}
				if (rolledNumber === 100) {
					isSuccess = false;
					messageContent += 'a FUMBLING FAILURE!';
				}
			} else {
				// Otherwise, normal success/failure evaluation
				if (isSuccess) {
					let degreesOfSuccess = 1 + (Math.floor((target + modifier) / 10) - Math.floor(rolledNumber / 10));
					messageContent += `a SUCCESS with ${pluralize(`degree`, degreesOfSuccess, true)} of success!`;
				} else {
					let degreesOfFailure = 1 + (Math.floor(rolledNumber / 10) - Math.floor((target + modifier) / 10));
					messageContent += `a FAILURE with ${pluralize(`degree`, degreesOfFailure, true)} of failure!`;
				}
			}

			let reply = await interaction.reply({content: messageContent, fetchReply: true});
			if (isSuccess) {
				reply.react('🎉');
			} else {
				reply.react('😢');
			}
		});
	}
};
