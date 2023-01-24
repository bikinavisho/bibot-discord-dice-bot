const Discord = require("discord.js");
const RandomOrg = require('random-org');
const _ = require('lodash');
const {log, cleanupLogDirectory} = require('./logging-util.js');
const {getCriteria, parseSuccessesString, parseCritSuccessString, parseCritFailureString, skillCheck, SKILL_CHECK_RESULTS} = require('./trinity-functions.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({ apiKey: process.env.RANDOM_API_KEY });
const client = new Discord.Client(
  { intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    //TODO: DMing the bot no longer works. figure out why.
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
  ] }
);

const prefix = ";";

client.on("ready", () => {
  console.log("I am ready!");
});

// automatically join any new threads
client.on('threadCreate', (thread) => {
  if (thread.joinable) thread.join();
});

client.on("messageCreate", function(message) {
  if (message.author.bot) return;
  if (message.channel.type === "dm" && !message.content.startsWith(prefix)) {
    message.content = prefix + message.content;
  }
  if (!message.content.startsWith(prefix)) return;

  const userAlias = message.member && message.member.nickname ? message.member.nickname : message.author.username;

  // take off the prefix
  const commandBody = message.content.slice(prefix.length);
  const args = _.compact(commandBody.split(' '));
  // command name (the first arg!)
  const command = args?.shift()?.toLowerCase();
  log('--------\n');
  log('Time of Request: ', new Date(Date.now()).toLocaleString())
  log(`Request initiated by: ${userAlias}`)
  log(`Command received: ${command}`);
  log(`Arguments received: ${args}`);

  try {
    switch(command) {
      case 'help':
        const embed = new Discord.MessageEmbed()
          .setTitle('Bibot\'s Commands')
          .setDescription('Commands available:\n '+
          `\`${prefix}roll [n]d[N]\` - will roll the specified number of di, with N sides, prints sum\n`+
          `\`${prefix}gurps [n]\` - will roll 3d6 and check the result against the number you specify\n`+
          `\`${prefix}pbta [n]\` - will roll 2d6+[n], with a partial success on 7+ and critical success on 10+ (note: n is optional)\n`+
          `\`${prefix}motw [n]\` - will roll 2d6+[n], with a partial success on 7+ and critical success on 10+ (note: n is optional)\n`+
          `\`${prefix}fate [n]\` - will roll 4 fate dice and add [n] to the result (note: n is optional)\n` +
          `\`${prefix}fate [n] = [y]\` - will roll 4 fate dice and add [n] to the result, then compare the total to given [y]\n` +
          `\`${prefix}raccoon [eyes/hands/feet] [n]\` - will roll n d6 according to the correponding raccoon stat and tell you the result of the highest dice rolled.\n` +
          `\`${prefix}roll R[rank] [modifiers, comma delineated]\` - will roll the number of dice corresponding to the rank given. If using the comma delineated modifiers, ensure that the number of modifiers given equals the number of ranks/dice being rolled.\n`+
          `\`${prefix}bulk [n]R[rank] [modifiers, comma dileneated]\` - will roll the given skill check [n] times`)
          .setFooter(`EXAMPLES: \n`+
          `\t[${prefix}roll R1 10] - This will roll 1d100 for a R1 skill/ability, with a modifier of 10.\n`+
          `\t[${prefix}roll R2 40,21] - This will roll 2d100 for a R2 skill/ability, with a modifier of 40 for the first roll, and 21 for the second roll.\n`+
          `\t[${prefix}roll R3 30] - This will roll 3d100 for a R3 skill/ability, with a modifier of 30 for the first, second, and third rolls.\n`+
          `\t[${prefix}bulk 5R2 20] - This will roll 2d100 for a R2 skill, with a modifier of 20 for both rolls, 5 times.\n`+
          `\t[${prefix}roll R2 100,20 -s -a2] - This will roll 2d100 for a R2 skill, with any thresholds above 150 counted as an automatic success(\`-s\`), and adds 2 automatic successes to the final total. (\`-a2\`)`)
            .setColor('LUMINOUS_VIVID_PINK')
        message.channel.send({embeds: [embed]});
        break;
      case 'ping':
        const timeTaken = Date.now() - message.createdTimestamp;
        // message.reply  @s the user who initiated the command
        message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
        break;
      case 'bing':
        message.reply('bong');
        if (_.includes(userAlias, "Steven")) {
          message.channel.send("Are you happy now Steven?");
        }
        if (message?.author?.username === "aDiCt#6430") {
          message.channel.send("Are you happy n   ow Steve?");
        }
        break;
      case 'rip':
        replyToUserWithoutMention(message, '<:rip:752693741440991323>');
        break;
      case 'tada':
        message.channel.send('Celebration!').then((myMessage) => {
          myMessage.react('🎉');
        }).catch((error) => {
          log('failed to add emoji :(')
        });
        break;
      case 'hi':
        message.reply({content: `Hello, ${userAlias}!`, allowedMentions: { repliedUser: false }});
        break;
      case 'perish':
        message.channel.send('<a:elmofire:898009933361078332>');
        break;
      case 'r':
      case 'roll':
        // if not not a number (read: is a number)
        if (!isNaN(Number(args[0]))) {
          log('told to roll a number instead of a dice')
          message.channel.send(`${userAlias} rolled ${args[0]}.`);
          break;
        }

        if (_.isEmpty(args[0])){
          // TODO: implement troll logic of randomly generating a number and then rolling that die
          log('told to roll but no parameters specified')
          replyToUserWithoutMention(message, `What did you _think_ would happen, ${userAlias}?`);
          break;
        }

        if (args[0].toLowerCase().startsWith('r')){
          // we are doing ranked rolling
          // expected command: [roll R3 10] OR [roll R3 10,10,10]

          //the number after the R represents the rank
          let rank = Number(args[0].slice(1));
          // ENSURE THAT RANK PASSED IS A NUMBER!
          if (isNaN(rank)) {
            log('rank was not a number');
            return;
          }

          let criteria = getCriteria(args[1], rank);
          log(`Criteria parsed as: ${criteria}`);

          log();

          let optionalArguments = args.filter((s) => s.match(/^-\w/))
          log('optionalArguments: ', optionalArguments);
          let skip150 = Boolean(optionalArguments.find((s) => s.match(/^-s/)));
          log('skip150 value: ' + skip150);
          let autoSuccesses = optionalArguments.find((s) => s.match(/^-a\d/)) ? Number(optionalArguments.find((s) => s.match(/^-a\d/)).replace("-", "").replace("a", "")) : 0;
          log('autoSuccesses value: ' + autoSuccesses);

          let randomConfig = {
            min: 1, max: 100, n: rank
          };
          random.generateIntegers(randomConfig).then((result) => {
            let returnedNumbers = result.random.data;
            let successes = 0;
            let criticalSuccesses = 0;  // less than 10 including 10
            let criticalFailures = 0;   // greater than 90, including 90
            let cancelledFailures = 0;

            if (autoSuccesses > 0) {
              successes += autoSuccesses;
            }

            returnedNumbers.forEach((num, i) => {
              log(`comparing ${num} with ${criteria[i]}`)
              // Add 50 to the first roll and evaluate result of comparison
              switch(skillCheck(num, criteria[i] + (i === 0 ? 50 : 0), skip150)) {
                case SKILL_CHECK_RESULTS.NO_SUCCESS:
                  cancelledFailures++;
                  log('\tno success');
                  break;
                case SKILL_CHECK_RESULTS.CRITICAL_FAILURE:
                  log('\tcrit failure')
                  criticalFailures++;
                  break;
                case SKILL_CHECK_RESULTS.CRITICAL_SUCCESS:
                  log('\tcrit success')
                  criticalSuccesses++;
                  successes++;
                case SKILL_CHECK_RESULTS.SUCCESS:
                  log('\tsuccess')
                  successes++;
                  break;
                default:
                  log('\tfailure')
              }
              // Handle super extraneous cases
              if (num === 1) {
                let successMessage = '';
                let successMessages = [
                  'The Divine Roll!',
                  'Deus Vult!',
                  'By The Glory Of Sollaris!',
                  'Miraculous!',
                  'The Gods Smile Down Upon Us This Day!',
                  'The Blind King cannot stand in the Light of the Sun!',
                  'The Flesh Burneth Away, Purifying The Soul!',
                  `${userAlias} cleaves the sky, upturning mountains and draining the sea!`,
                  'Flesh and Blood make way for the Divine Steel!',
                  'By The Power Of Grayskull!',
                  `${userAlias.toUpperCase()} HAS THE POWER!!`,
                  `${userAlias} somehow managed to succeed, despite their numerous inequities.`,
                  `By some stroke of Luck or Fate, ${userAlias} was successful!`,
                  `${userAlias}'s success was definitely intentional, and in no way an accident.`,
                  `Despite the quality of ${userAlias}\'s character, and all efforts to the contrary, ${userAlias} managed to succeed.`,
                  'By The Divine Light!',
                  'A dragon\'s hoarde awaits!',
                  'Onwards to Victory!',
                  'Ohhhh yeaaaahhhh'
                ];
                // Randomly select one of the above success messages
                let chosenIndex = _.random(0, successMessages.length-1)
                // Add the success message to the final success message string
                successMessage += successMessages[chosenIndex];
                successMessage += `\n\t*${userAlias} rolled a \`${num}\`! Gain 1 talent.*`
                message.channel.send(successMessage).then((happyMessage) => {
                  happyMessage.react('🎉')
                }).catch((error) => {
                  log('failed to add reaction to critical success message. See error: ', error)
                });
              }
              if (num === 100) {
                message.channel.send(`<:rip:752693741440991323> Wah wah wah. ${userAlias} failed catastrophically! (You rolled a \`${num}\`.)`)
                  .then((sadMessage) => {
                    sadMessage.react('😢')
                  }).catch((error) => {
                    log('failed to add reaction to critical failure message. See error: ', error)
                  })
              }
            });
            // subtract critical failures from the total number of successes
            successes = successes - criticalFailures;

            // Construct the result string
            let resultString = '';
            resultString += parseSuccessesString(successes);
            resultString += parseCritSuccessString(criticalSuccesses);
            resultString += parseCritFailureString(criticalFailures);

            // Compile the string of rolled number array `[50, 50, 50]`
            let rolledNumberString = `\`[${String(returnedNumbers).replace(/,/g, ', ')}]\``;

            // Replace any dice that shouldn't have been rolled with the letter S
            if (skip150) {
              returnedNumbers.forEach((n, i) => {
                if ((i == 0 && criteria[i] + 50 >= 150) || criteria[i] >= 150) {
                  rolledNumberString = rolledNumberString.replace(String(n), 'S');
                }
              });
              resultString += "\n\t*Any thresholds above 150 have been automatically added to successes, marked by an `S`.*"
            }

            if (criticalSuccesses > 0) {
              resultString += `\n\t*Gain ${criticalSuccesses} XP.* `
            }
            if (criticalFailures > 0) {
              resultString += `\n\t*Note: Critical failures have been subtracted from the total number of successes.*`
            }
            if (cancelledFailures > 0) {
              resultString += `\n\t*Note: Due to high threshold (100-150), ${cancelledFailures} critical failure${cancelledFailures == 1 ? '' : 's'} ${cancelledFailures == 1 ? 'has' : 'have'} been negated.*`
            }

            // Send final message to channel
            message.channel.send(`${userAlias} rolled... ${rolledNumberString} Result: ${resultString}`)
              .then((resultMessage) => {
                if ((successes > 0 || criticalSuccesses > 0) && criticalFailures == 0) {
                  resultMessage.react('🎉');
                }
                if (criticalFailures > 0) {
                  resultMessage.react('752693741440991323')
                }
                if (successes == 0 && criticalSuccesses == 0) {
                  resultMessage.react('😢')
                }
              })
              .catch((reactError) => {
                log('failed to add reaction to result message. See errror: ', reactError)
              });
          }).catch((error) => {
            log('ERROR: RANDOM ORG API HAS FAILED US. SEE ERROR: ', error)
          });

        } else {
          if (/[0-9]{1,2}d[0-9]{1,3}/.test(args[0]) === false && /\d{1,2}d\d[+-]\d{1,2}/.test(args[0]) === false) {
            log(`argument not in proper format. received ${args[0]} instead of xdy`);
            break;
          }

          let modifier, numOfDice, dice;
          // format: 1d9+9, 1d10+10, 1d100+100
          if (/\d{1,2}d\d{1,3}[+-]\d{1,3}/.test(args[0])) {
            let sign = args[0].indexOf('+') !== -1 ? '+' : '-'

            modifier = Number(args[0].slice(args[0].indexOf(sign)+1))
            dice = Number(args[0].slice(args[0].indexOf('d')+1, args[0].indexOf(sign)))
          }
          // format: 1d9, 1d10, 1d100
          else if (/[0-9]{1,2}d[0-9]{1,3}/.test(args[0])) {
            dice = Number(args[0].slice(args[0].indexOf('d')+1))
          }
          log('numOfDice ' + args[0].slice(0, args[0].indexOf('d')))
          numOfDice = Number(args[0].slice(0, args[0].indexOf('d')));

          if (isNaN(numOfDice)){
            log('number of dice given was not a number');
            break;
          }
          if (isNaN(dice)){
            log('dice given was not a number');
            break;
          }

          // check for random.org limits
          if (numOfDice > 10000) {
            replyToUserWithoutMention(message, 'Please select a number of dice smaller than 10,000.');
            break;
          }
          if (numOfDice < 0) {
            replyToUserWithoutMention(message, 'Please select a positive number of dice.');
            break;
          }
          if (dice > 2000000000) {
            replyToUserWithoutMention(message, 'Please select a die with less than 2,000,000,000 sides.')
            break;
          }

          // if number of dice is zero just print
          if (numOfDice === 0) {
            if (modifier) {
              replyToUserWithoutMention(message, `${userAlias} Roll: \`[0]\` + \`${modifier}\` \nTotal: \`${_.sum([0, modifier])}\``)
            } else {
              replyToUserWithoutMention(message, `${userAlias} Roll: \`[0]\` \nTotal: \`0\``)
            }
            break;
          }

          // This bot disapproves of you trying to roll a d1.
          if (dice == 1) {
            let rejectionMessages = [
              'No.',
              'I refuse.',
              'No. Why do you even want to roll a d1?',
              'No.',
              'I refuse.',
              'No. I\'m not rolling a d1.',
              'No.',
              'I refuse to comply with your foolish request.',
              'Fine. 1. You got a 1. Are you happy now?',
              'No.',
              'I refuse.',
              'I must respectfully decline your request. (Because it\'s stupid.)'
            ];
            // Randomly select one of the above success messages
            let chosenIndex = _.random(0, rejectionMessages.length-1)
            replyToUserWithoutMention(message, rejectionMessages[chosenIndex]);
            break;
          }

          log(`rolling ${numOfDice} d${dice}`);
          let randomConfig = {
            min: 1, max: dice, n: numOfDice
          };
          random.generateIntegers(randomConfig).then((result) => {
            let returnedNumbers = result.random.data;
            let messageContent;
            if (modifier) {
              messageContent = `${userAlias} Roll: \`[${String(returnedNumbers).replace(/,/g, ', ')}]\` + \`${modifier}\` \nTotal: \`${_.sum([...returnedNumbers, modifier])}\``;
            } else {
              messageContent = `${userAlias} Roll: \`[${String(returnedNumbers).replace(/,/g, ', ')}]\` \nTotal: \`${_.sum(returnedNumbers)}\``;
            }
            //TODO: come up with a better solution to exceeding Discord's max character limit
            if (messageContent.length > 2000) {
              let appendToEndString = '...`]' + messageContent.slice(messageContent.indexOf(']`')+2)
              messageContent = messageContent.slice(0, (2000 - appendToEndString.length));
              messageContent += appendToEndString;
              log('message has been truncated due to excessive length');
            }
            replyToUserWithoutMention(message, messageContent);
          }).catch((error) => {
            log('ERROR: RANDOM ORG API HAS FAILED US. SEE ERROR: ', error)
          });
        }
        break;
      case 'craft':
      case 'bulk':
        if (/^\d{1,2}r\d/.test(args[0].toLowerCase())) {
          let numberOfBatchRolls, rank;
          if (/^\d{1}r\d/.test(args[0].toLowerCase())) {
            numberOfBatchRolls = args[0].substring(0, 1);
            rank = args[0].slice(2);
          } else if (/^\d{2}r\d/.test(args[0].toLowerCase())) {
            numberOfBatchRolls = args[0].substring(0, 2);
            rank = args[0].slice(3);
          } else {
            log('numberOfBatchRolls did not match regex');
            break;
          }
          numberOfBatchRolls = Number(numberOfBatchRolls);
          rank = Number(rank);
          if (isNaN(numberOfBatchRolls) || isNaN(rank)) {
            log('numberOfBatchRolls or rank was not a number');
            break;
          }
          log(`Rank: ${rank},  Number of Batch Rolls: ${numberOfBatchRolls}`);

          let criteria = getCriteria(args[1], rank);
          log(`Criteria parsed as: ${criteria}`);

          let randomConfig = {
            min: 1, max: 100, n: rank * numberOfBatchRolls
          };
          random.generateIntegers(randomConfig).then((result) => {
            let returnedNumbers = result.random.data;

            // Make an array of arrays to reflect that we are rolling for a set,
            // a multitude of times
            let numberResults = [];
            while (!_.isEmpty(returnedNumbers)) {
              numberResults.push(returnedNumbers.splice(-rank));
            }
            numberResults = numberResults.reverse();
            if (numberResults.length != numberOfBatchRolls) {
              log(`something went wrong. there are only ${numberResults.length} sets of results, not ${numberOfBatchRolls}`);
            }

            let outputString = '';
            numberResults.forEach((resultArray, n) => {
              let successes = 0;
              let criticalSuccesses = 0;  // less than 10 including 10
              let criticalFailures = 0;   // greater than 90, including 90

              // "1: [n,n,n,n,n] - "
              outputString += `${n+1}: \`[${String(resultArray).replace(/,/g, ', ')}]\` - `;

              // Compare the rolled numbers with the criteria given
              resultArray.forEach((rolledNumber, i) => {
                log(`comparing ${rolledNumber} with ${criteria[i]}${i === 0 ? '+50' : ''}`)

                switch(skillCheck(rolledNumber, criteria[i] + (i === 0 ? 50 : 0))) {
                  case SKILL_CHECK_RESULTS.CRITICAL_FAILURE:
                    log('\tcrit failure')
                    criticalFailures++;
                    break;
                  case SKILL_CHECK_RESULTS.CRITICAL_SUCCESS:
                    log('\tcrit success')
                    criticalSuccesses++;
                  case SKILL_CHECK_RESULTS.SUCCESS:
                    log('\tsuccess')
                    successes++;
                    break;
                  default:
                    log('\tfailure')
                }
              });

              outputString += parseSuccessesString(successes);
              outputString += parseCritSuccessString(criticalSuccesses);
              outputString += parseCritFailureString(criticalFailures);
              // if (criticalSuccesses > 0 && criticalFailures > 0) {
              //   outputString += `${criticalFailures} Critical Successes are cancelled by Critical Failures. `;
              // }
              outputString += '\n'
            });

            // Send final message to channel
            const embeddedMessage = new Discord.MessageEmbed()
              .setTitle(`${userAlias}'s ${command === 'craft' ? 'Crafting ' : ''}Rolls`)
              .setDescription(outputString)
              .setColor('GREEN')
            message.channel.send({embeds: [embeddedMessage]});
          }).catch((error) => {
            log('ERROR: RANDOM ORG API HAS FAILED US. SEE ERROR: ', error)
          });


        }
        break;
      case 'gurps':
        let threshold = args[0];
        if (isNaN(threshold)) {
          log('comparative number was not a number')
          break;
        }
        log('rolling 3d6')
        let gurpsRandomConfig = {
          min: 1, max: 6, n: 3
        };
        random.generateIntegers(gurpsRandomConfig).then((result) => {
          let returnedNumbers = result.random.data;
          let total = _.sum(returnedNumbers)
          if (total < threshold) {
            log(`${userAlias} succeeded (${total})`)
          } else {
            log(`${userAlias} failed (${total})`)
          }
          message.channel.send(`${userAlias} Rolled: \`3d6\` = (\`${String(returnedNumbers).replace(/,/g, ' + ')}\`) = \`${total}\`\n${total > threshold ? `Failure! \`${total}<${threshold}\`` : `Success! \`${total}<${threshold}\``}${total == 18 ? `\n${userAlias} critically failed!` : ''}`)
            .then((gurpsMessage) => {
              if (total === 18) {
                gurpsMessage.react(client.emojis.resolveIdentifier('752693741440991323'));
              } else if (total > threshold) {
                gurpsMessage.react('😢');
              } else {
                gurpsMessage.react('🎉');
              }

            }).catch((reactError) => {
              log('Error with adding emoji: ', reactError)
            });
        }).catch((error) => {
          log('ERROR: RANDOM ORG API HAS FAILED US. SEE ERROR: ', error)
        });
        break;
      case 'pbta':
      case 'motw':
        let modifier = Number(args[0]);
        let isNoModifier = false;
        if (isNaN(modifier)) {
          log('modifier was not a number')
          isNoModifier = true;
        }
        log('rolling 2d6');
        let motwRandomConfig = {
          min: 1, max: 6, n: 2
        };
        random.generateIntegers(motwRandomConfig).then((result) => {
          let returnedNumbers = result.random.data;
          let total = _.sum(returnedNumbers)
          let motwMessageString;
          if (isNoModifier) {
            motwMessageString = `${userAlias} Rolled: \`2d6\` = (\`${String(returnedNumbers).replace(/,/g, ' + ')}\`) = \`${total}\`\n`
          } else {
            total += modifier;
            motwMessageString = `${userAlias} Rolled: \`2d6\` = (\`${String(returnedNumbers).replace(/,/g, ' + ')} + ${modifier}\`) = \`${total}\`\n`
          }
          let success = false;
          let partialSuccess = false;
          let failure = false;
          if (total >= 10) {
            log(`${userAlias} succeeded critically`)
            motwMessageString += `${userAlias} succeeded critically.`
            success = true;
          } else if (total >= 7) {
            log(`${userAlias} partially succeeded`)
            motwMessageString += `${userAlias} partially succeeded.`
            partialSuccess = true;
          } else {
            log(`${userAlias} failed`)
            motwMessageString += `${userAlias} failed.`
            failure = true;
          }
          message.channel.send(motwMessageString)
            .then((motwMessage) => {
              if (failure) {
                motwMessage.react('😢');
              }
              if (success) {
                motwMessage.react('🎉');
              }
              if (partialSuccess) {
                motwMessage.react('🙂');
              }
            }).catch((reactError) => {
              log('Error with adding emoji: ', reactError)
            });
        }).catch((error) => {
          log('ERROR: RANDOM ORG API HAS FAILED US. SEE ERROR: ', error)
        });
        break;
      case 'fate':
        let fateModifier = Number(args[0]);
        let isNoFateModifier = false;
        if (isNaN(fateModifier)) {
          log('modifier was not a number')
          isNoFateModifier = true;
        }
        log('rolling 4d6');
        let fateRandomConfig = {
          min: 1, max: 6, n: 4
        };
        random.generateIntegers(fateRandomConfig).then((result) => {
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

          if (isNoFateModifier) {
            fateMessageString = `${userAlias} Rolled: \`4dF\` = (${fateMessageString}) = \`${total}\`\n`
          } else {
            total += fateModifier;
            log('the calculated total WITH modifiers is: ', total)
            fateMessageString = `${userAlias} Rolled: \`4dF\` = (${fateMessageString}) + \`${fateModifier}\`  =  \`${total}\`\n`
          }


          // if they passed in [= num] then compare to that and report on their success/failure
          let success = false;
          let failure = false;
          if (args[1] === '=' && !isNaN((Number(args[2])))) {
            let successMetric = Number(args[2]);

            if (total >= successMetric) {
              log(`${userAlias} succeeded`)
              fateMessageString += `${userAlias} succeeded.`
              success = true;
            } else {
              log(`${userAlias} failed`)
              fateMessageString += `${userAlias} failed.`
              failure = true;
            }
          }


          message.channel.send(fateMessageString)
            .then((fateMessage) => {
              if (failure) {
                fateMessage.react('😢');
              }
              if (success) {
                fateMessage.react('🎉');
              }
            }).catch((reactError) => {
              log('Error with adding emoji: ', reactError)
            });
        }).catch((error) => {
          log('ERROR: RANDOM ORG API HAS FAILED US. SEE ERROR: ', error)
        });
        break;
      case 'raccoon':
        let raccoonMode = args[0];
        let raccoonStat = Number(args[1]);
        if (isNaN(raccoonStat)) {
          log('stat was not a number')
          return;
        }
        let successArray;
        switch(raccoonMode) {
          case 'eyes':
            successArray = [
              'Your conclusion is confident. If you pick this option, you describe what’s really going on; otherwise, the GM does. (Or the player to your left, if you’re playing without a GM.)',
              'Your conclusion is persuasive. Each raccoon other than you rolls one extra die the next time they act on the information you provide.',
              'Your conclusion is actually correct.'
            ];
            break;
          case 'hands':
            successArray = [
              'You obtain what you were aiming for. If you pick this option, you describe the success of your mischief; otherwise, you end up stealing the wrong object, getting an unexpected response from whatever you’re messing with, etc., as described by the GM. (Or by the player to your left, if you’re playing without a GM.)',
              'You gain a temporary tool, asset, or other advantage. Set aside one die; at any point, you or another raccoon can describe how they exploit the advantage, pick up the die, and add it to their roll. You can even do this after seeing a roll’s outcome, if you can think of a way that the asset in question might save your butt. The die goes away after it’s used.',
              'You don’t draw unwanted attention to yourself in the process.'
            ];
            break;
          case 'feet':
            successArray = [
              'You get where you want to go. If you pick this result, you describe how you avoid the threat or reach your destination; otherwise, the GM describes the new predicament you’ve gotten yourself into. (Or the player to your left, if you’re playing without a GM.)',
              'You give another raccoon a boost, allowing them to avoid the threat or reach your destination instead of you – or in addition to you, if you also picked the first option.',
              'You manage not to look completely ridiculous. Clear one point of Stress from any Virtue.'
            ];
            break;
          default:
            log(`invalid raccoon mode: ${raccoonMode}`);
            return;
        }
        log(`rolling ${raccoonStat}d6`);
        let raccoonRandomConfig = {
          min: 1, max: 6, n: raccoonStat
        };
        random.generateIntegers(raccoonRandomConfig).then((result) => {
          let returnedNumbers = result.random.data;
          let raccoonMessageString;
          raccoonMessageString = `${userAlias} Rolled: \`${raccoonStat}d6\`: \`[${String(returnedNumbers).replace(/,/g, ', ')}]\` \n`

          let success = false;
          let partialSuccess = false;
          let failure = false;
          if (_.includes(returnedNumbers, 6)) {
            log(`${userAlias} succeeded critically`)
            raccoonMessageString += `${userAlias} succeeded critically. Select two from the following list.\n`
            success = true;
          } else if (_.includes(returnedNumbers, 5) || _.includes(returnedNumbers, 4)) {
            log(`${userAlias} partially succeeded`)
            raccoonMessageString += `${userAlias} partially succeeded. Select one from the following list.\n`
            partialSuccess = true;
          } else {
            log(`${userAlias} failed`)
            raccoonMessageString += `${userAlias} failed. Mark one point of Stress against this Virtue.`
            failure = true;
          }

          if (success || partialSuccess) {
            raccoonMessageString += `> -${successArray[0]}\n> -${successArray[1]}\n> -${successArray[2]}`
          }
          message.channel.send(raccoonMessageString)
            .then((raccoonMessage) => {
              if (failure) {
                raccoonMessage.react('😢');
              }
              if (success) {
                raccoonMessage.react('🎉');
              }
              if (partialSuccess) {
                raccoonMessage.react('🙂');
              }
            }).catch((reactError) => {
              log('Error with adding emoji: ', reactError)
            });
        }).catch((error) => {
          log('ERROR: RANDOM ORG API HAS FAILED US. SEE ERROR: ', error)
        });
        break;
    }
    // end try
  } catch (exep) {
    log("AN EXCEPTION WAS THROWN DURING EXECUTION: ", exep)
  }

  log('\n');

  cleanupLogDirectory();

});

function replyToUserWithoutMention(message, content) {
  return message.reply({content, allowedMentions: { repliedUser: false }});
}



client.login(process.env.BOT_TOKEN);
