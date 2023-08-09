const { SlashCommandBuilder } = require('discord.js');

const {log, cleanupLogDirectory} = require('../logging-util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command. Only for use by developers of this bot.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload.')
				.setRequired(true)),
	async execute(interaction) {
    if (interaction.user.username === 'bikinavisho' || interaction.user.username === 'bikinavisho#0000') {
      const commandName = interaction.options.getString('command', true).toLowerCase();
  		const command = interaction.client.commands.get(commandName);

  		if (!command) {
				log(`no such command (${commandName})`)
  			return interaction.reply(`There is no command with name \`${commandName}\`!`);
  		}

      delete require.cache[require.resolve(`./${command.data.name}.js`)];

      try {
      	interaction.client.commands.delete(command.data.name);
      	const newCommand = require(`./${command.data.name}.js`);
      	interaction.client.commands.set(newCommand.data.name, newCommand);
				log(commandName + ' was reloaded successfully.')
      	await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
      } catch (error) {
      	console.error(error);
				log(commandName + ' was NOT reloaded successfully.')
      	await interaction.reply(`There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
      }
    } else {
			log('user not authorized')
      return interaction.reply('user not authorized to execute this command');
    }

	},
};
