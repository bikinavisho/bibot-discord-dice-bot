const Discord = require("discord.js");
const RandomOrg = require('random-org');
const _ = require('lodash');
const {log, cleanupLogDirectory} = require('./logging-util.js');
const {getCriteria, parseSuccessesString, parseCritSuccessString, parseCritFailureString, skillCheck, SKILL_CHECK_RESULTS} = require('./trinity-functions.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({ apiKey: process.env.RANDOM_API_KEY });
const client = new Discord.Client();

const prefix = ";";

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", function(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const userAlias = message.member && message.member.nickname ? message.member.nickname : message.author.username;

  // take off the prefix
  const commandBody = message.content.slice(prefix.length);
  const args = _.compact(commandBody.split(' '));
  // command name (the first arg!)
  const command = args.shift().toLowerCase();
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
          `\`${prefix}roll R[rank] [modifiers, comma delineated]\` - will roll the number of dice corresponding to the rank given. If using the comma delineated modifiers, ensure that the number of modifiers given equals the number of ranks/dice being rolled.\n`+
          `\`${prefix}bulk [n]R[rank] [modifiers, comma dileneated]\` - will roll the given skill check [n] times`)
          .setFooter(`EXAMPLES: \n`+
          `\t[${prefix}roll R1 10] - This will roll 1d100 for a R1 skill/ability, with a modifier of 10.\n`+
          `\t[${prefix}roll R2 40,21] - This will roll 2d100 for a R2 skill/ability, with a modifier of 40 for the first roll, and 21 for the second roll.\n`+
          `\t[${prefix}roll R3 30] - This will roll 3d100 for a R3 skill/ability, with a modifier of 30 for the first, second, and third rolls.\n`+
          `\t[${prefix}bulk 5R2 20] - This will roll 2d100 for a R2 skill, with a modifier of 20 for both rolls, 5 times.`)
            .setColor('LUMINOUS_VIVID_PINK')
        message.channel.send(embed);
        break;
      case 'ping':
        const timeTaken = Date.now() - message.createdTimestamp;
        // message.reply  @s the user who initiated the command
        message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
        break;
      case 'rip':
        message.channel.send('<:rip:752693741440991323>');
        break;
      case 'tada':
        message.channel.send('Celebration!').then((myMessage) => {
          myMessage.react('🎉');
        }).catch((error) => {
          log('failed to add emoji :(')
        });
        break;
      case 'hi':
        message.channel.send(`Hello, ${userAlias}!`);
        break;
      case 'r':
      case 'roll':
        // TODO: IF SENT ROLL RANDOM SHIT, RESPOND WITH "I'M SORRY, I CAN'T DO THAT"
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

          let randomConfig = {
            min: 1, max: 100, n: rank
          };
          random.generateIntegers(randomConfig).then((result) => {
            let returnedNumbers = result.random.data;
            let successes = 0;
            let criticalSuccesses = 0;  // less than 10 including 10
            let criticalFailures = 0;   // greater than 90, including 90
            returnedNumbers.forEach((num, i) => {
              log(`comparing ${num} with ${criteria[i]}`)
              // Add 50 to the first roll and evaluate result of comparison
              switch(skillCheck(num, criteria[i] + (i === 0 ? 50 : 0))) {
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
                successMessage += ` (${userAlias} rolled a \`${num}\`!)`
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

            // Construct the result string
            let resultString = '';
            resultString += parseSuccessesString(successes);
            resultString += parseCritSuccessString(criticalSuccesses);
            resultString += parseCritFailureString(criticalFailures);
            // Send final message to channel
            message.channel.send(`${userAlias} rolled... \`[${String(returnedNumbers).replace(/,/g, ', ')}]\` Result: ${resultString}`)
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
          let numOfDice = Number(args[0].slice(0, args[0].indexOf('d')));
          let dice = Number(args[0].slice(args[0].indexOf('d')+1))
          if (isNaN(numOfDice)){
            log('number of dice given was not a number');
            return;
          }
          if (isNaN(dice)){
            log('dice given was not a number');
            return;
          }
          log(`rolling ${numOfDice} d${dice}`);
          let randomConfig = {
            min: 1, max: dice, n: numOfDice
          };
          random.generateIntegers(randomConfig).then((result) => {
            let returnedNumbers = result.random.data;
            message.channel.send(`${userAlias} Roll: \`[${String(returnedNumbers).replace(/,/g, ', ')}]\` \nTotal: \`${_.sum(returnedNumbers)}\``);
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
            message.channel.send(embeddedMessage);
          }).catch((error) => {
            log('ERROR: RANDOM ORG API HAS FAILED US. SEE ERROR: ', error)
          });


        }
        break;
      case 'gurps':
        let threshold = args[0];
        if (isNaN(threshold)) {
          log('comparative number was not a number')
          return;
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
    }
    // end try
  } catch (exep) {
    log("AN EXCEPTION WAS THROWN DURING EXECUTION: ", exep)
  }

  log('\n');

  cleanupLogDirectory();

});



client.login(process.env.BOT_TOKEN);
