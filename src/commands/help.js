const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {log} = require('../logging-util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Prints out a list of all commands that Bibot can handle.'),
	async execute(interaction) {
    const prefix = '\\';
    const footerText = `EXAMPLES: \n`+
    `\t[${prefix}roll R1 10] - This will roll 1d100 for a R1 skill/ability, with a modifier of 10.\n`+
    `\t[${prefix}roll R2 40,21] - This will roll 2d100 for a R2 skill/ability, with a modifier of 40 for the first roll, and 21 for the second roll.\n`+
    `\t[${prefix}roll R3 30] - This will roll 3d100 for a R3 skill/ability, with a modifier of 30 for the first, second, and third rolls.\n`+
    `\t[${prefix}bulk 5R2 20] - This will roll 2d100 for a R2 skill, with a modifier of 20 for both rolls, 5 times.\n`+
    `\t[${prefix}roll R2 100,20 -s -a2] - This will roll 2d100 for a R2 skill, with any thresholds above 150 counted as an automatic success(\`-s\`), and adds 2 automatic successes to the final total. (\`-a2\`)`;
    const embed = new EmbedBuilder()
      .setTitle('Bibot\'s Commands')
      .setDescription('Commands available:\n '+
        `\`${prefix}roll dice [n]d[N]\` - will roll the specified number of di, with N sides, prints sum\n`+
        `\`${prefix}draw [n]\` - will draw n number of cards from a single deck of cards (without replacement)  \n` +
        `\`${prefix}gurps [n]\` - will roll 3d6 and check the result against the number you specify\n`+
        `\`${prefix}pbta [n]\` - will roll 2d6+[n], with a partial success on 7+ and critical success on 10+ (note: n is optional)\n`+
        `\`${prefix}motw [n]\` - will roll 2d6+[n], with a partial success on 7+ and critical success on 10+ (note: n is optional)\n`+
        `\`${prefix}fate [n]\` - will roll 4 fate dice and add [n] to the result (note: n is optional)\n` +
        `\`${prefix}fate [n] = [y]\` - will roll 4 fate dice and add [n] to the result, then compare the total to given [y]\n` +
        `\`${prefix}mistborn [n]\` - will roll [n]d6 according to mistborn rules\n` +
        `\`${prefix}raccoon [eyes/hands/feet] [n]\` - will roll n d6 according to the correponding raccoon stat and tell you the result of the highest dice rolled.\n` +
        `\`${prefix}roll ranked [rank] [modifiers, comma delineated]\` - will roll the number of dice corresponding to the rank given. If using the comma delineated modifiers, ensure that the number of modifiers given equals the number of ranks/dice being rolled.\n`+
        `\`${prefix}bulk [n]R[rank] [modifiers, comma delineated]\` - will roll the given skill check [n] times\n` +
				`\`${prefix}feedback - sends feedback to the developer`
			)
      .setFooter({text: footerText})
      .setColor('LuminousVividPink')

    await interaction.reply({embeds: [embed], allowedMentions: { repliedUser: false }});
	},
};
