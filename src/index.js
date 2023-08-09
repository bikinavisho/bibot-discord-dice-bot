// THIS IS V2 OF THE BOT, IMPLEMENTING SLASH COMMANDS

const Discord = require("discord.js");
const RandomOrg = require('random-org');
const _ = require('lodash');
const fs = require('node:fs');
const path = require('node:path');

const {log, cleanupLogDirectory} = require('./logging-util.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({ apiKey: process.env.RANDOM_API_KEY });
const client = new Discord.Client(
  {
    intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.MessageContent,
      Discord.GatewayIntentBits.DirectMessages,
      Discord.GatewayIntentBits.DirectMessageReactions
    ]
  }
);


// Create the commands list, accessible from the client parent object
client.commands = new Discord.Collection();

// =============== dynamically intake all of the commands owo ===============
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}
// ================= okay we have the commands now uwu =================


// once Bibot is ready, report for duty!
client.once(Discord.Events.ClientReady, c => {
	log(`Bibot is ready and reporting for duty! Logged in as ${c.user.tag}`);
  // clean up log directory on initialization of the application
  cleanupLogDirectory();
});


// when interaction is created, summon the command's execution!
client.on(Discord.Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;


  log('------------------------------\n');
  log('Time of Request: ', new Date(Date.now()).toLocaleString())
  const userAlias = interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;
  log(`Request initiated by: ${userAlias}`)
  log(`Request initiated in server: ${interaction.guild && interaction.guild.name ? interaction.guild.name : 'N/A'}`)
  log(`Command received: ${interaction.commandName}`);
  log('\n')


  const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction).then(() => {
      log();
      log(`Command \`${interaction.commandName}\` was successfully executed!`)
    });
	} catch (error) {
    log();
		console.error(error);
    log('An error occurred while performing the command!');
    log('\t', error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

  log('\n');

});


client.login(process.env.BOT_TOKEN);
