const Discord = require('discord.js');
const RandomOrg = require('random-org');
const _ = require('lodash');

const {log} = require('../logging-util.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({apiKey: process.env.RANDOM_API_KEY});

module.exports = {
	data: new Discord.SlashCommandBuilder()
		.setName('mistborn')
		.setDescription('Performs a skill check for the Mistborn TTRPG.')
		.addIntegerOption((option) =>
			option.setName('attribute').setDescription('The attribute you are using for this check').setRequired(true)
		),
	async execute(interaction) {
		const userAlias =
			interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

		let attribute = interaction.options.getInteger('attribute');

		log(`rolling ${attribute}d6`);
		let isHarder = false;
		if (attribute == 1) {
			attribute = 2;
			isHarder = true;
		}
		let extraNudges;
		if (attribute > 10) {
			extraNudges = attribute - 10;
			attribute = 10;
		}
		let randomConfig = {
			min: 1,
			max: 6,
			n: attribute
		};
		await random.generateIntegers(randomConfig).then(async (result) => {
			let returnedNumbers = result.random.data;
			let mistbornMessageString = `${userAlias} rolled: \`${attribute}d6\`: \`[${String(returnedNumbers.sort()).replace(/,/g, ', ')}]\` \n`;
			// count up nudges and count up pairs
			let nudgeCount = _.filter(returnedNumbers, (n) => n == 6).length;
			if (extraNudges) {
				nudgeCount += extraNudges;
			}
			let fivePairs = _.filter(returnedNumbers, (n) => n == 5).length;
			let fourPairs = _.filter(returnedNumbers, (n) => n == 4).length;
			let threePairs = _.filter(returnedNumbers, (n) => n == 3).length;
			let twoPairs = _.filter(returnedNumbers, (n) => n == 2).length;
			let onePairs = _.filter(returnedNumbers, (n) => n == 1).length;
			// determine the highest pair
			let highestPair;
			if (fivePairs > 1) highestPair = 5;
			else if (fourPairs > 1) highestPair = 4;
			else if (threePairs > 1) highestPair = 3;
			else if (twoPairs > 1) highestPair = 2;
			else if (onePairs > 1) highestPair = 1;
			// print the output
			if (highestPair) {
				mistbornMessageString += `Highest pair is \`${highestPair}\`, with \`${nudgeCount}\` nudge${nudgeCount == 1 ? '' : 's'}.\n`;
			} else {
				mistbornMessageString += `You failed, with \`${nudgeCount}\` nudge${nudgeCount == 1 ? '' : 's'}.\n`;
			}
			if (isHarder) {
				mistbornMessageString +=
					'Since your attribute was 1, an additional dice has been added at the expense of increased difficulty.\n';
			}
			if (extraNudges) {
				mistbornMessageString += `\`${extraNudges}\` extra nudges have been provided since >10 attribute was input.`;
			}

			await interaction.reply(mistbornMessageString);
		});
	}
};
