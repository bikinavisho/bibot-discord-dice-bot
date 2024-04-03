const Discord = require('discord.js');
const {log} = require('../logging-util.js');

module.exports = {
	data: new Discord.SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Sends feedback to the developer of Bibot.')
		.addStringOption((option) =>
			option
				.setName('feedback')
				.setDescription('What feedback would you like to provide? Type it out here!')
				.setRequired(true)
		),
	async execute(interaction) {
		log('feedback has been sent');

		// const userAlias = interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;
		const FEEDBACK_CHANNEL_ID = '888279636503560193';

		let feedback = interaction.options.getString('feedback');

		const channel = await interaction.client.channels.fetch(FEEDBACK_CHANNEL_ID);
		channel.send(`FEEDBACK FOR BIBOT RECEIVED: \n>>> ${feedback}`);

		await interaction.reply('Your feedback has been received! Thank you!');

		log('feedback has been received.');
	}
};
