const Discord = require('discord.js');
const RandomOrg = require('random-org');
const _ = require('lodash');

const {log} = require('../logging-util.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({apiKey: process.env.RANDOM_API_KEY});

module.exports = {
	data: new Discord.SlashCommandBuilder()
		.setName('gurps')
		.setDescription('Performs a GURPS skill check.')
		.addIntegerOption((option) =>
			option.setName('threshold').setDescription('The number you need to succeed.').setRequired(true)
		),
	async execute(interaction) {
		const userAlias =
			interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

		let threshold = interaction.options.getInteger('threshold');

		log(`rolling 3d6 aiming for ${threshold}`);

		let randomConfig = {
			min: 1,
			max: 6,
			n: 3
		};

		await random.generateIntegers(randomConfig).then(async (result) => {
			let returnedNumbers = result.random.data;
			let total = _.sum(returnedNumbers);
			if (total < threshold) {
				log(`${userAlias} succeeded (${total})`);
			} else {
				log(`${userAlias} failed (${total})`);
			}
			let message = `${userAlias} rolled: \`3d6\` = (\`${String(returnedNumbers).replace(/,/g, ' + ')}\`) = \`${total}\`\n${total > threshold ? `Failure! \`${total}<${threshold}\`` : `Success! \`${total}<${threshold}\``}${total == 18 ? `\n${userAlias} critically failed!` : ''}`;
			const reply = await interaction.reply({content: message, fetchReply: true});
			if (total === 18) {
				reply.react(client.emojis.resolveIdentifier('752693741440991323'));
			} else if (total > threshold) {
				reply.react('😢');
			} else {
				reply.react('🎉');
			}
		});
	}
};
