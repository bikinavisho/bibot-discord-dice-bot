const _ = require('lodash');
const RandomOrg = require('random-org');

const {log, cleanupLogDirectory} = require('../logging-util.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({ apiKey: process.env.RANDOM_API_KEY });

async function executePoweredByTheApocalypseSkillCheck(interaction) {
  const userAlias = interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

  let modifier = interaction.options.getInteger('modifier') ?? 0;

  log(`rolling 2d6 with a modifier of ${modifier}`);

  let randomConfig = {
    min: 1, max: 6, n: 2
  };

  await random.generateIntegers(randomConfig).then(async (result) => {
    let returnedNumbers = result.random.data;

    let total = _.sum(returnedNumbers)

    let messageString;
    if (modifier) {
      total += modifier;
      messageString = `${userAlias} rolled: \`2d6\` = (\`${String(returnedNumbers).replace(/,/g, ' + ')}\`)\` + ${modifier}\` = \`${total}\`\n`
    } else {
      messageString = `${userAlias} rolled: \`2d6\` = (\`${String(returnedNumbers).replace(/,/g, ' + ')}\`) = \`${total}\`\n`
    }

    let success = false;
    let partialSuccess = false;
    let failure = false;
    if (total >= 10) {
      log(`${userAlias} succeeded critically`)
      messageString += `${userAlias} succeeded critically.`
      success = true;
    } else if (total >= 7) {
      log(`${userAlias} partially succeeded`)
      messageString += `${userAlias} partially succeeded.`
      partialSuccess = true;
    } else {
      log(`${userAlias} failed`)
      messageString += `${userAlias} failed.`
      failure = true;
    }

    const reply = await interaction.reply({content: messageString, fetchReply: true});
    if (failure) {
      reply.react('😢');
    }
    if (success) {
      reply.react('🎉');
    }
    if (partialSuccess) {
      reply.react('🙂');
    }
  })
}


module.exports = {
  executePoweredByTheApocalypseSkillCheck
};
