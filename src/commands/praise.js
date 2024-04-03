const {SlashCommandBuilder} = require('discord.js');

const PRAISE_THE_SUN_EMOTE = '<a:praisethesun:681222773481537838>';

module.exports = {
	data: new SlashCommandBuilder().setName('praise').setDescription('Praise The Sun!'),
	async execute(interaction) {
		await interaction
			.reply(`Praise The Sun! ${PRAISE_THE_SUN_EMOTE}`)
			.then((msg) => msg.react(PRAISE_THE_SUN_EMOTE));
	}
};
