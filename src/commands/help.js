const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Prints out a list of all commands that Bibot can handle.'),
	async execute(interaction) {
		const prefix = '\\';
		const footerText =
			`EXAMPLES: \n` +
			`\t[${prefix}roll rank=1 magnitude=10] - This will roll 1d100 for a R1 skill/ability, with a modifier of 10.\n` +
			`\t[${prefix}roll rank=2 magnitude=40,21] - This will roll 2d100 for a R2 skill/ability, with a modifier of 40 for the first roll, and 21 for the second roll.\n` +
			`\t[${prefix}roll rank=3 magnitude=30] - This will roll 3d100 for a R3 skill/ability, with a modifier of 30 for the first, second, and third rolls.\n` +
			`\t[${prefix}bulk repetitions=5 rank=2 magnitude=20] - This will roll 2d100 for a R2 skill, with a modifier of 20 for both rolls, 5 times.\n` +
			`\t[${prefix}roll rank=2 magnitude=100,20 skip150=true auto-successes=2] - This will roll 2d100 for a R2 skill, with any thresholds above 150 counted as an automatic success(\`skip150\`), and adds 2 automatic successes to the final total. (\`auto-successes\`)`;
		const embed = new EmbedBuilder()
			.setTitle("Bibot's Commands")
			.setDescription(
				'Commands available:\n ' +
					`- \`${prefix}roll dice [number_of_dice] [number_of_sides]\` - will roll the specified number of di, with the specified number of sides, and print their sum\n` +
					`- \`${prefix}draw [number_of_cards]\` - will draw n number of cards from a single deck of cards (without replacement)  \n` +
					`- \`${prefix}gurps [threshold]\` - will roll 3d6 and check the result against the number you specify\n` +
					`- \`${prefix}pbta [modifier]\` - will roll 2d6+[modifier], with a partial success on 7+ and critical success on 10+\n` +
					`- \`${prefix}motw [modifier]\` - will roll 2d6+[modifier], with a partial success on 7+ and critical success on 10+\n` +
					`- \`${prefix}fate [modifier]\` - will roll 4 fate dice and add [modifier] to the result\n` +
					`- \`${prefix}fate [modifier] [threshold]\` - will roll 4 fate dice and add [modifier] to the result, then compare the total to given [threshold]\n` +
					`- \`${prefix}mistborn [attribute]\` - will roll [attribute]d6 according to mistborn rules\n` +
					`- \`${prefix}raccoon [raccoon_mode] [raccoon_stat]\` - will roll [raccoon_stat] d6 according to the correponding raccoon stat and tell you the result of the highest dice rolled.\n` +
					`- \`${prefix}roll ranked [rank] [magnitude, comma delineated]\` - will roll the number of dice corresponding to the rank given, with [magnitude] added on to the threshold you must be under.\n` +
					`- \`${prefix}bulk [repetitions] [rank] [magnitude, comma delineated]\` - will roll the given skill check [repetitions] times\n` +
					`- \`${prefix}feedback [feedback]\` - sends feedback to the developer`
			)
			.setFooter({text: footerText})
			.setColor('LuminousVividPink');

		await interaction.reply({embeds: [embed], allowedMentions: {repliedUser: false}});
	}
};
