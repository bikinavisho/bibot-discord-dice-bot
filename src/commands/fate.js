const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');
const RandomOrg = require('random-org');

const {log} = require('../logging-util.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({ apiKey: process.env.RANDOM_API_KEY });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fate')
		.setDescription('Performs a skill check for FATE.')
    .addIntegerOption(option =>
			option.setName('modifier')
				.setDescription('a modifier to the overall roll, can be positive or negative')
				.setRequired(false)
		)
    .addIntegerOption(option =>
			option.setName('threshold')
				.setDescription('the number you are trying to beat with your roll')
				.setRequired(false)
		)
  ,
	async execute(interaction) {
    const userAlias = interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

    let modifier = interaction.options.getInteger('modifier') ?? 0;
    let threshold = interaction.options.getInteger('threshold');

    log(`rolling 4d6 with a modifier of ${modifier}, aiming for ${threshold}`);
    let randomConfig = {
      min: 1, max: 6, n: 4
    };
    await random.generateIntegers(randomConfig).then(async (result) => {
      let returnedNumbers = result.random.data;
      let fateMappedNumbers = returnedNumbers.map((originalNumber) => {
        let fateNumber = originalNumber % 3;
        if (fateNumber === 2) {
          return -1;
        } else {
          return fateNumber;
        }
      });
      log('Mapped d6 to fate results: ', fateMappedNumbers);

      let total = _.sum(fateMappedNumbers)
      log('the calculated total without modifiers is: ', total)

      let fateMessageString =  '';
      fateMappedNumbers.forEach((num) => {
        switch(num) {
          case 0:
            fateMessageString += '<:fate_blank:803795355865972816> '
            break;
          case 1:
            fateMessageString += '<:fate_plus:803795386711146506> '
            break;
          case -1:
            fateMessageString += '<:fate_minus:803795372160974868> '
            break;
          default:
            log(`something went wrong in the fate dice conversion. [${num}] was not 0, 1, or -1)`);
        }
      });

      if (modifier) {
        total += modifier;
        log('the calculated total WITH modifiers is: ', total)
        fateMessageString = `${userAlias} rolled: \`4dF\` = (${fateMessageString}) + \`${modifier}\`  =  \`${total}\`\n`
      } else {
        fateMessageString = `${userAlias} rolled: \`4dF\` = (${fateMessageString}) = \`${total}\`\n`
      }

      // if they passed in threshold then compare to that and report on their success/failure
      let success = false;
      let failure = false;
      if (threshold) {
        if (total >= threshold) {
          log(`${userAlias} succeeded`)
          fateMessageString += `${userAlias} succeeded. \`${total} ≥ ${threshold}\``
          success = true;
        } else {
          log(`${userAlias} failed`)
          fateMessageString += `${userAlias} failed. \`${total} < ${threshold}\``
          failure = true;
        }
      }

      let reply = await interaction.reply({content: fateMessageString, fetchReply: true});
      if (failure) {
        reply.react('😢');
      }
      if (success) {
        reply.react('🎉');
      }
    });
	},
};
