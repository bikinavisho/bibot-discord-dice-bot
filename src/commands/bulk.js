const Discord = require('discord.js');
const RandomOrg = require('random-org');
const _ = require('lodash');

const {log} = require('../logging-util.js');
const {
	getCriteria,
	parseSuccessesString,
	parseCritSuccessString,
	parseCritFailureString,
	skillCheck,
	SKILL_CHECK_RESULTS
} = require('../utility-functions/trinity-functions.js');
const {evaluateSuccess, EVALUATION_RESULT} = require('../utility-functions/nuevo-huevo-juego.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({apiKey: process.env.RANDOM_API_KEY});

function isPlural(num) {
	return num !== 1;
}

module.exports = {
	data: new Discord.SlashCommandBuilder()
		.setName('bulk')
		.setDescription('Roll different skill checks in bulk.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('nhj')
				.setDescription('Roll a series of checks in the NHJ system, typically used for meditation.')
				.addIntegerOption((option) =>
					option
						.setName('repetitions')
						.setDescription('how many checks do you want to do? (hours meditating)')
						.setMinValue(2)
						.setMaxValue(50)
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('modifier')
						.setDescription(
							'a modifier to the overall roll, can be positive or negative (your meditation step #)'
						)
						.setRequired(true)
				)
				.addStringOption((option) =>
					option.setName('comment').setDescription('Add a comment to your roll.').setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('ranked')
				.setDescription('Rolls ranked skill checks in bulk, typically for use in crafting.')
				.addIntegerOption((option) =>
					option
						.setName('repetitions')
						.setDescription('how many times you want to perform this skill check')
						.setMinValue(2)
						.setMaxValue(50)
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('rank')
						.setDescription('the highest rank of relevant skills/attributes')
						.setMinValue(1)
						.setMaxValue(10)
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('magnitude')
						.setDescription(
							'the magnitude(s) of the skills/attributes being used, comma-dileneated (ex: 20,10)'
						)
						.setRequired(true)
				)
				.addBooleanOption((option) =>
					option
						.setName('skip150')
						.setDescription(
							'skip rolling dice corresponding to magnitude above 150, opting instead for an automatic success'
						)
						.setRequired(false)
				)
				.addIntegerOption((option) =>
					option
						.setName('auto-successes')
						.setDescription('the number of auto successes which apply to this skill check (defaults to 0)')
						.setMinValue(1)
						.setMaxValue(10)
						.setRequired(false)
				)
		),
	async execute(interaction) {
		const userAlias =
			interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

		if (interaction.options.getSubcommand() === 'nhj') {
			log('nuevo huevo juego BULK dice roll BEGIN!');

			let numberOfBatchRolls = interaction.options.getInteger('repetitions');
			let modifier = interaction.options.getInteger('modifier');
			let comment = interaction.options.getString('comment');

			log(`received parameters: {repetitions: ${numberOfBatchRolls}, modifier: ${modifier}}`);

			let randomConfig = {
				min: 1,
				max: 100,
				n: numberOfBatchRolls
			};
			await random.generateIntegers(randomConfig).then(async (result) => {
				let returnedNumbers = result.random.data;

				let totalTotalFailures = 0;
				let totalGreatFailures = 0;
				let totalFailures = 0;
				let totalPartialFailures = 0;
				let totalPartialSuccesses = 0;
				let totalSuccesses = 0;
				let totalGreaterSuccesses = 0;

				let numberOfCriticalSuccesses = 0;
				let numberOfSuperCriticalSuccesses = 0;

				returnedNumbers.forEach((diceResult) => {
					if (diceResult === 100) {
						numberOfSuperCriticalSuccesses++;
					}
					if (diceResult >= 90 && diceResult <= 99) {
						numberOfCriticalSuccesses++;
					}

					let sum = diceResult + modifier;

					switch (evaluateSuccess(sum)) {
						case EVALUATION_RESULT.TOTAL_FAILURE:
							totalTotalFailures++;
							break;
						case EVALUATION_RESULT.GREAT_FAILURE:
							totalGreatFailures++;
							break;
						case EVALUATION_RESULT.FAILURE:
							totalFailures++;
							break;
						case EVALUATION_RESULT.PARTIAL_FAILURE:
							totalPartialFailures++;
							break;
						case EVALUATION_RESULT.PARTIAL_SUCCESS:
							totalPartialSuccesses++;
							break;
						case EVALUATION_RESULT.SUCCESS:
							totalSuccesses++;
							break;
						case EVALUATION_RESULT.DOUBLE_SUCCESS:
							totalSuccesses += 2;
							break;
						case EVALUATION_RESULT.TRIPLE_SUCCESS:
							totalSuccesses += 3;
							break;
						case EVALUATION_RESULT.QUADRUPLE_SUCCESS:
							totalSuccesses += 4;
							break;
						case EVALUATION_RESULT.GREATER_SUCCESS:
							totalGreaterSuccesses++;
							break;
					}
				});

				log('statistics dump --------------------------------------');
				log(`\tnumber of total failures: ${totalTotalFailures}`);
				log(`\tnumber of great failures: ${totalGreatFailures}`);
				log(`\tnumber of [normal] failures: ${totalFailures}`);
				log(`\tnumber of partial failures: ${totalPartialFailures}`);
				log(`\tnumber of partial successes: ${totalPartialSuccesses}`);
				log(`\tnumber of successes (cumulative): ${totalSuccesses}`);
				log(`\tnumber of greater successes: ${totalGreaterSuccesses}`);
				log('------------------------------------------------------');

				let titleString = `${userAlias}'s Rolls`;
				if (comment) {
					titleString += `for ${comment}`;
				}
				let outputString = `${userAlias} rolled ${numberOfBatchRolls}d100s with a modifier of ${modifier}. Here are the results.\n`;
				outputString += `\t\`[${String(returnedNumbers).replace(/,/g, ', ')}]\`\n`;
				let footerText = '';
				if (numberOfCriticalSuccesses > 0) {
					footerText += `You rolled ${numberOfCriticalSuccesses} critical success${isPlural(numberOfCriticalSuccesses) ? 'es' : ''}. Add ${numberOfCriticalSuccesses} step${isPlural(numberOfCriticalSuccesses) ? 's' : ''} to the rolled attribute or skill.\n`;
				}
				if (numberOfSuperCriticalSuccesses > 0) {
					footerText += `You rolled ${numberOfSuperCriticalSuccesses} super critical success${isPlural(numberOfSuperCriticalSuccesses) ? 'es' : ''} (100!). Add ${numberOfSuperCriticalSuccesses} talent to the rolled attribute or skill.\n`;
				}
				let randomCuteEmoticons = [
					'(◠‿◠✿)',
					'(◕‿◕✿)',
					'●‿●',
					'ヾ(＠⌒▽⌒＠)ﾉ',
					'(◡‿◡✿)',
					'✿◕ ‿ ◕✿',
					'ヽ(‘ ∇‘ )ノ',
					'(ﾟヮﾟ)',
					'(∪ ◡ ∪)',
					'≧◡≦',
					'｡◕ ‿ ◕｡',
					'╰(◡‿◡✿╰)',
					'◕‿◕',
					'◕ ◡ ◕',
					'(¬‿¬)',
					'(*˘︶˘*)',
					'१✌˚◡˚✌५',
					'＼(^-^)／',
					'^‿^',
					'₊·*◟(˶╹̆ꇴ╹̆˵)◜‧*･',
					'ᵔᴥᵔ',
					'(｡◕‿◕｡)',
					'(◑‿◐)',
					'ᵔᴥᵔ',
					'₍•͈ᴗ•͈₎',
					'ଘ(੭ˊ꒳ˋ)੭✧',
					'(｡≍ฺ‿≍)⚟ʜᴇʜ♥',
					'˙˚ଘo(∗ ❛ั ᵕ ❛ั )੭່˙',
					'(•⚗৺⚗•)',
					'(⚈᷀᷁ᴗ⚈᷀᷁⁎)',
					'(✧≖‿ゝ≖)'
				];
				let chosenIndex = _.random(0, randomCuteEmoticons.length - 1);
				let theChosenEmoticon = randomCuteEmoticons[chosenIndex];
				if (_.isEmpty(footerText)) {
					footerText = theChosenEmoticon;
				} else {
					footerText = theChosenEmoticon + '\n' + footerText;
				}

				const embeddedMessage = new Discord.EmbedBuilder()
					.setTitle(titleString)
					.setDescription(outputString)
					.addFields(
						{name: 'Total Failures', value: String(totalTotalFailures), inline: true},
						{name: 'Great Failures', value: String(totalGreatFailures), inline: true},
						{name: 'Failures', value: String(totalFailures), inline: true},
						{name: 'Partial Failures', value: String(totalPartialFailures), inline: true},
						{name: 'Partial Successes', value: String(totalPartialSuccesses), inline: true},
						{name: 'Successes (cumulative)', value: String(totalSuccesses), inline: true},
						{name: 'Greater Successes', value: String(totalGreaterSuccesses), inline: true}
					)
					.setColor('Gold')
					.setFooter({text: footerText});
				await interaction.reply({embeds: [embeddedMessage], fetchReply: true}).then((msg) => {
					if (numberOfSuperCriticalSuccesses > 0) {
						msg.react('<a:praisethesun:681222773481537838>');
					}
					if (numberOfCriticalSuccesses > 0) {
						msg.react('🎉');
					}
				});
			});
		}

		if (interaction.options.getSubcommand() === 'ranked') {
			let numberOfBatchRolls = interaction.options.getInteger('repetitions');
			let rank = interaction.options.getInteger('rank');
			let magnitude = interaction.options.getString('magnitude');
			let autoSuccesses = interaction.options.getInteger('auto-successes') ?? 0;
			let skip150 = interaction.options.getBoolean('skip150') ?? false;

			log(
				`received parameters: {repetitions: ${numberOfBatchRolls}, rank: ${rank}, magnitude: ${magnitude}, autoSuccesses: ${autoSuccesses}, skip150: ${skip150}}`
			);

			magnitude = magnitude.replaceAll(' ', '');

			let criteria = getCriteria(magnitude, rank);
			log(`Criteria parsed as: ${criteria}`);

			let randomConfig = {
				min: 1,
				max: 100,
				n: rank * numberOfBatchRolls
			};

			await random.generateIntegers(randomConfig).then(async (result) => {
				let returnedNumbers = result.random.data;

				// Make an array of arrays to reflect that we are rolling for a set,
				// a multitude of times
				let numberResults = [];
				while (!_.isEmpty(returnedNumbers)) {
					numberResults.push(returnedNumbers.splice(-rank));
				}
				numberResults = numberResults.reverse();
				if (numberResults.length != numberOfBatchRolls) {
					log(
						`something went wrong. there are only ${numberResults.length} sets of results, not ${numberOfBatchRolls}`
					);
				}

				let outputString = '';
				numberResults.forEach((resultArray, n) => {
					let successes = 0;
					let criticalSuccesses = 0; // less than 10 including 10
					let criticalFailures = 0; // greater than 90, including 90
					// eslint-disable-next-line no-unused-vars
					let cancelledFailures = 0;
					//TODO: figure out what's up with ^ not being used

					if (autoSuccesses > 0) {
						successes += autoSuccesses;
					}

					let resultArrayWithSkips = [];

					// Compare the rolled numbers with the criteria given
					resultArray.forEach((rolledNumber, i) => {
						log(`comparing ${rolledNumber} with ${criteria[i]}${i === 0 ? '+50' : ''}`);

						// add 50 to the first one
						let accurateCriteria = criteria[i] + (i === 0 ? 50 : 0);
						switch (skillCheck(rolledNumber, accurateCriteria, skip150)) {
							case SKILL_CHECK_RESULTS.NO_SUCCESS:
								log('\tno success');
								cancelledFailures++;
								if (accurateCriteria >= 150 && !skip150) {
									resultArrayWithSkips.push('X');
								} else {
									resultArrayWithSkips.push(rolledNumber);
								}
								break;
							case SKILL_CHECK_RESULTS.CRITICAL_FAILURE:
								log('\tcrit failure');
								criticalFailures++;
								resultArrayWithSkips.push(rolledNumber);
								break;
							case SKILL_CHECK_RESULTS.CRITICAL_SUCCESS:
								log('\tcrit success');
								criticalSuccesses++;
								resultArrayWithSkips.push(rolledNumber);
							case SKILL_CHECK_RESULTS.SUCCESS:
								log('\tsuccess');
								successes++;
								if (accurateCriteria >= 150) {
									resultArrayWithSkips.push('S');
								} else {
									resultArrayWithSkips.push(rolledNumber);
								}
								break;
							default:
								log('\tfailure');
								resultArrayWithSkips.push(rolledNumber);
						}
					});

					// "1: [n,n,n,n,n] - "
					outputString += `${n + 1}: \`[${String(resultArrayWithSkips).replace(/,/g, ', ')}]\` - `;

					// subtract critical failures from the total number of successes
					successes = successes - criticalFailures;

					outputString += parseSuccessesString(successes);
					outputString += parseCritSuccessString(criticalSuccesses);
					outputString += parseCritFailureString(criticalFailures);
					outputString += '\n';
				});

				// Send final message to channel
				const embeddedMessage = new Discord.EmbedBuilder()
					.setTitle(`${userAlias}'s Rolls`)
					.setDescription(outputString)
					.setColor('Green');
				let footerText =
					'Anything marked with an S was above 150 magnitude and automatically counted as a success.';
				if (!skip150) {
					footerText +=
						'\nAnything marked with an X was above 150 but rolled a critical failure and thus the success and failure cancelled each other out.';
				}
				embeddedMessage.setFooter({text: footerText});
				await interaction.reply({embeds: [embeddedMessage]});
			});
		}
	}
};
