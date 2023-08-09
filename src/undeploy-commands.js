const Discord = require("discord.js");
const fs = require('node:fs');
const path = require('node:path');

const {log} = require('./logging-util.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const rest = new Discord.REST().setToken(process.env.BOT_TOKEN);

// server id for Parfait Dirt
const GUILD_ID = "909614983820771369";

// delete all commands GLOBALLY
rest.put(Discord.Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands GLOBALLY.'))
	.catch(console.error);

// delete the guild commands in MSkies
// rest.put(Discord.Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID), { body: [] })
// 	.then(() => console.log('Successfully deleted all guild commands in PARFAIT DIRT.'))
// 	.catch(console.error);
