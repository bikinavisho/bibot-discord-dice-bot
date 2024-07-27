const {SlashCommandBuilder} = require('discord.js');
const _ = require('lodash');
const RandomOrg = require('random-org');

const {log} = require('../logging-util.js');
const ARRAY_OF_FORTUNE = require('../constants/array-of-fortune.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({apiKey: process.env.RANDOM_API_KEY});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fortune')
		.setDescription('Randomly selects a virtual fortune cookie for you crack open.'),
	async execute(interaction) {
		const userAlias = interaction.member?.nickname ? interaction.member?.nickname : interaction.user?.username;

		log('\tit is time to gaze upon thine fortune');

		let randomConfig = {
			min: 1,
			max: ARRAY_OF_FORTUNE.length,
			n: 1
		};
		await random.generateIntegers(randomConfig).then(async (result) => {
			let returnedNumbers = result.random.data;
			let chosenFortuneIndex = _.first(returnedNumbers);
			let chosenFortune = ARRAY_OF_FORTUNE[chosenFortuneIndex - 1];

			log(`\t${userAlias} has received the fortune: [[${chosenFortune}]]`);

			await interaction.reply({content: `🥠 ${chosenFortune}`});
		});
	}
};
