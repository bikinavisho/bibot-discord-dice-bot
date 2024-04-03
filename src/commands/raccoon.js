const {SlashCommandBuilder} = require('discord.js');
const _ = require('lodash');
const RandomOrg = require('random-org');

const {log} = require('../logging-util.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({apiKey: process.env.RANDOM_API_KEY});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('raccoon')
		.setDescription('Performs a skill check for 3 Racoons in a Trenchcoat.')
		.addStringOption((option) =>
			option
				.setName('raccoon_mode')
				.setDescription('The Virtue by which you are attempting to solve this problem.')
				.setRequired(true)
				.addChoices(
					{name: 'Beady Little Eyes', value: 'eyes'},
					{name: 'Grabby Little Hands', value: 'hands'},
					{name: 'Lively Little Feet', value: 'feet'}
				)
		)
		.addIntegerOption((option) =>
			option
				.setName('raccoon_stat')
				.setDescription('Your proficiency with the Virtue you have chosen.')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(3)
		),
	async execute(interaction) {
		const userAlias =
			interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

		let raccoonMode = interaction.options.getString('raccoon_mode');
		let raccoonStat = interaction.options.getInteger('raccoon_stat');

		log(`user chose to use ${raccoonMode} with a proficiency of ${raccoonStat}`);

		let successArray;
		switch (raccoonMode) {
			case 'eyes':
				successArray = [
					'Your conclusion is confident. If you pick this option, you describe what’s really going on; otherwise, the GM does. (Or the player to your left, if you’re playing without a GM.)',
					'Your conclusion is persuasive. Each raccoon other than you rolls one extra die the next time they act on the information you provide.',
					'Your conclusion is actually correct.'
				];
				break;
			case 'hands':
				successArray = [
					'You obtain what you were aiming for. If you pick this option, you describe the success of your mischief; otherwise, you end up stealing the wrong object, getting an unexpected response from whatever you’re messing with, etc., as described by the GM. (Or by the player to your left, if you’re playing without a GM.)',
					'You gain a temporary tool, asset, or other advantage. Set aside one die; at any point, you or another raccoon can describe how they exploit the advantage, pick up the die, and add it to their roll. You can even do this after seeing a roll’s outcome, if you can think of a way that the asset in question might save your butt. The die goes away after it’s used.',
					'You don’t draw unwanted attention to yourself in the process.'
				];
				break;
			case 'feet':
				successArray = [
					'You get where you want to go. If you pick this result, you describe how you avoid the threat or reach your destination; otherwise, the GM describes the new predicament you’ve gotten yourself into. (Or the player to your left, if you’re playing without a GM.)',
					'You give another raccoon a boost, allowing them to avoid the threat or reach your destination instead of you – or in addition to you, if you also picked the first option.',
					'You manage not to look completely ridiculous. Clear one point of Stress from any Virtue.'
				];
				break;
			default:
				log(`invalid raccoon mode: ${raccoonMode}`);
				return;
		}
		log(`rolling ${raccoonStat}d6`);
		let raccoonRandomConfig = {
			min: 1,
			max: 6,
			n: raccoonStat
		};
		await random.generateIntegers(raccoonRandomConfig).then(async (result) => {
			let returnedNumbers = result.random.data;
			let raccoonMessageString;
			raccoonMessageString = `${userAlias} rolled: \`${raccoonStat}d6\`: \`[${String(returnedNumbers).replace(/,/g, ', ')}]\` \n`;

			let success = false;
			let partialSuccess = false;
			let failure = false;
			if (_.includes(returnedNumbers, 6)) {
				log(`${userAlias} succeeded critically`);
				raccoonMessageString += `${userAlias} succeeded critically. Select two from the following list.\n`;
				success = true;
			} else if (_.includes(returnedNumbers, 5) || _.includes(returnedNumbers, 4)) {
				log(`${userAlias} partially succeeded`);
				raccoonMessageString += `${userAlias} partially succeeded. Select one from the following list.\n`;
				partialSuccess = true;
			} else {
				log(`${userAlias} failed`);
				raccoonMessageString += `${userAlias} failed. Mark one point of Stress against this Virtue.`;
				failure = true;
			}

			if (success || partialSuccess) {
				// print out the success option list since the user has to select one or more from it
				raccoonMessageString += `> - ${successArray[0]}\n> - ${successArray[1]}\n> - ${successArray[2]}`;
			}
			let reply = await interaction.reply({content: raccoonMessageString, fetchReply: true});
			if (failure) {
				reply.react('😢');
			}
			if (success) {
				reply.react('🎉');
			}
			if (partialSuccess) {
				reply.react('🙂');
			}
		});
	}
};
