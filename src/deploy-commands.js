const Discord = require("discord.js");
const fs = require('node:fs');
const path = require('node:path');

const {log} = require('./logging-util.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const rest = new Discord.REST().setToken(process.env.BOT_TOKEN);

// deploy commands to only MSkies
// rest.put(Discord.Routes.applicationGuildCommands(process.env.CLIENT_ID, "909614983820771369"), { body: commands })
// 	.then((data) => console.log(`Successfully registered ${data.length} application commands to PARFAIT DIRT.`))
// 	.catch(console.error);

// deploy commands GLOBALLY
rest.put(Discord.Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
	.then(data => console.log(`Successfully registered ${data.length} application commands GLOBALLY.`))
	.catch(console.error);
