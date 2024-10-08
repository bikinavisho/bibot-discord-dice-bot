const _ = require('lodash');
const RandomOrg = require('random-org');

const {log} = require('../logging-util.js');
const {
	getCriteria,
	parseSuccessesString,
	parseCritSuccessString,
	parseCritFailureString,
	skillCheck,
	SKILL_CHECK_RESULTS
} = require('./trinity-functions.js');
const {
	determineReaction,
	evaluateSuccess,
	printNuevoHuegoJuegoMessage,
	EVALUATION_RESULT
} = require('./nuevo-huevo-juego.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({apiKey: process.env.RANDOM_API_KEY});

function generateSuperSuccessMessageArray(userAlias) {
	return [
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
		`Despite the quality of ${userAlias}'s character, and all efforts to the contrary, ${userAlias} managed to succeed.`,
		'By The Divine Light!',
		"A dragon's hoarde awaits!",
		'Onwards to Victory!',
		'Ohhhh yeaaaahhhh',
		'Praise The Sun!',
		'You *can* see Mount Tai, way to go!',
		'Your bloodline stirs...',
		"That's a Big Rig you got there."
	];
}

const PRAISE_THE_SUN_EMOJI = '<a:praisethesun:681222773481537838>';

async function executeNormalDiceRoll(interaction) {
	const userAlias =
		interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

	let numberOfSides = interaction.options.getInteger('number_of_sides');
	let numberOfDice = interaction.options.getInteger('number_of_dice') ?? 1;
	let modifier = interaction.options.getInteger('modifier') ?? 0;

	log(`rolling ${numberOfDice} d${numberOfSides} with a modifier of ${modifier}`);

	let randomConfig = {
		min: 1,
		max: numberOfSides,
		n: numberOfDice
	};

	await random.generateIntegers(randomConfig).then(async (result) => {
		let returnedNumbers = result.random.data;
		let messageContent;
		if (modifier) {
			messageContent = `${userAlias} rolled ${numberOfDice}d${numberOfSides}: \`[${String(returnedNumbers).replace(/,/g, ', ')}]\` + \`${modifier}\` \nTotal: \`${_.sum([...returnedNumbers, modifier])}\``;
		} else {
			messageContent = `${userAlias} rolled ${numberOfDice}d${numberOfSides}: \`[${String(returnedNumbers).replace(/,/g, ', ')}]\` \nTotal: \`${_.sum(returnedNumbers)}\``;
		}

		// discord will error out and not reply if you exceed the 2000 character limit
		// truncate it so that the truncation is in the printing of the numbers,
		// not the resulting total
		if (messageContent.length > 2000) {
			let appendToEndString = '...`]' + messageContent.slice(messageContent.indexOf(']`') + 2);
			messageContent = messageContent.slice(0, 2000 - appendToEndString.length);
			messageContent += appendToEndString;
			log('message has been truncated due to excessive length');
		}

		await interaction.reply(messageContent);
	});
}

async function executeNuevoHuevoJuegoDiceRoll(interaction) {
	log('nuevo huevo juego dice roll BEGIN!');

	const userAlias =
		interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;
	let modifier = interaction.options.getInteger('modifier') ?? 0;
	let greaterSuccesses = interaction.options.getInteger('greater_successes') ?? 0;

	log(`received parameters: {modifier: ${modifier}, greaterSuccesses: ${greaterSuccesses}}`);

	let randomConfig = {
		min: 1,
		max: 100,
		n: 1
	};
	await random.generateIntegers(randomConfig).then(async (result) => {
		let returnedNumbers = result.random.data;

		let diceResult = returnedNumbers.at(0);
		log(`rolled 1d100, resulting in: ${diceResult}`);
		let sum = diceResult + modifier;
		let messageContent = '';

		let botReaction; // used for reacting to the message at the end

		messageContent += `${userAlias} rolled: \`1d100\` = \`(${diceResult}) + ${modifier} = ${sum}\`\n`;
		messageContent += '\tthus resulting in ';

		let evaluationResult = evaluateSuccess(sum);
		// adjust for crit failures
		if (diceResult === 1 || (diceResult >= 2 && diceResult <= 10)) {
			let negativeSuccesses;
			if (diceResult === 1) {
				log(`${userAlias} rolled a 1. Critical failure. -2 Successes.`);
				negativeSuccesses = 2;
			}
			if (diceResult >= 2 && diceResult <= 10) {
				log(`${userAlias} rolled between 2 and 10. A slightly critical failure. -1 Success.`);
				negativeSuccesses = 1;
			}
			log(`previous evaluation: ${evaluationResult}`);
			let currentEvaluationIndex = Object.keys(EVALUATION_RESULT).indexOf(evaluationResult);
			let newEvaluationIndex = Math.max(currentEvaluationIndex - negativeSuccesses, 0);
			evaluationResult = EVALUATION_RESULT[Object.keys(EVALUATION_RESULT)[newEvaluationIndex]];
			log(`new evaluation: ${evaluationResult}`);
		}
		botReaction = determineReaction(evaluationResult);
		// will add something that flows in the sentence, such as "a Total Failure" or "a Greater Success";
		messageContent += printNuevoHuegoJuegoMessage(evaluationResult);
		messageContent += '.';

		if (greaterSuccesses > 0) {
			log(`${greaterSuccesses} added to the result (verbally, not mathematically)`);
			messageContent += `\nAdd ${greaterSuccesses} Greater Successes to your result.`;
		}

		// crit success logic
		if (diceResult >= 90 && diceResult <= 99) {
			log('crit success');
			messageContent += '\n\t*Gain 1 step in the rolled attribute or skill.*';
		}
		if (diceResult === 100) {
			log('super crit success');
			let successMessages = generateSuperSuccessMessageArray(userAlias);
			// Randomly select one of the above success messages
			let chosenIndex = _.random(0, successMessages.length - 1);
			let successMessage = successMessages[chosenIndex];

			// send a message with specialized phrasing for super critical success
			successMessage += `\n\t*${userAlias} rolled a \`100\`! Gain 1 talent.*`;
			await interaction.channel.send(successMessage).then((msg) => {
				msg.react(PRAISE_THE_SUN_EMOJI);
			});
			// successMessage += '\n\nThis was a Super Critical Success. Gain a permanent non-retroactive 1xp discount per step, which can go no lower than 1xp per step.';
		}
		// crit fail logic
		if (diceResult <= 10) {
			log('crit failure');
			messageContent += '\n\n⚠️You got a Critical Failure.';
			// override bot reaction
			botReaction = '😨';
		}

		let comment = interaction.options.getString('comment');
		if (comment) {
			log(`adding comment: "${comment}"`);
			messageContent += `\n\nFor: \`${comment}\``;
		}

		await interaction.reply({content: messageContent, fetchReply: true}).then((msg) => {
			log('reacting to reply...');
			msg.react(botReaction);
			log('reaction sent.');
		});
	});
}

async function executeRankedSkillCheck(interaction) {
	const userAlias =
		interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

	let rank = interaction.options.getInteger('rank');
	let magnitude = interaction.options.getString('magnitude');
	let autoSuccesses = interaction.options.getInteger('auto-successes') ?? 0;
	let skip150 = interaction.options.getBoolean('skip150') ?? false;

	log(
		`received parameters: {rank: ${rank}, magnitude: ${magnitude}, autoSuccesses: ${autoSuccesses}, skip150: ${skip150}}`
	);

	// remove spaces from magnitude
	magnitude = magnitude.replaceAll(' ', '');

	//parse out the numbers inside the string of #,#,#
	let criteria = getCriteria(magnitude, rank);
	log(`Criteria parsed as: ${criteria}`);
	criteria.forEach((c) => {
		if (isNaN(Number(c))) {
			throw new Error('criteria passed in was not a number.');
		}
	});

	let randomConfig = {
		min: 1,
		max: 100,
		n: rank
	};
	await random.generateIntegers(randomConfig).then(async (result) => {
		let returnedNumbers = result.random.data;
		let successes = 0;
		let criticalSuccesses = 0; // less than 10 including 10
		let criticalFailures = 0; // greater than 90, including 90
		let cancelledFailures = 0;
		let hasOver150 = false;

		if (autoSuccesses > 0) {
			successes += autoSuccesses;
		}

		returnedNumbers.forEach(async (num, i) => {
			log(`comparing ${num} with ${criteria[i]}`);

			if (criteria[i] + (i === 0 ? 50 : 0) >= 150) {
				hasOver150 = true;
			}

			// Add 50 to the first roll and evaluate result of comparison
			switch (skillCheck(num, criteria[i] + (i === 0 ? 50 : 0), skip150)) {
				case SKILL_CHECK_RESULTS.NO_SUCCESS:
					cancelledFailures++;
					log('\tno success');
					break;
				case SKILL_CHECK_RESULTS.CRITICAL_FAILURE:
					log('\tcrit failure');
					criticalFailures++;
					break;
				case SKILL_CHECK_RESULTS.CRITICAL_SUCCESS:
					log('\tcrit success');
					criticalSuccesses++;
					successes++;
				case SKILL_CHECK_RESULTS.SUCCESS:
					log('\tsuccess');
					successes++;
					break;
				default:
					log('\tfailure');
			}
			// Handle super extraneous cases
			if (num === 1) {
				let successMessage = '';
				let successMessages = generateSuperSuccessMessageArray(userAlias);
				// Randomly select one of the above success messages
				let chosenIndex = _.random(0, successMessages.length - 1);
				// Add the success message to the final success message string
				successMessage += successMessages[chosenIndex];
				successMessage += `\n\t*${userAlias} rolled a \`${num}\`! Gain 1 talent.*`;
				await interaction.channel.send(successMessage).then((msg) => {
					msg.react('🎉');
				});
			}
			if (num === 100) {
				let sadMessage = `<:rip:752693741440991323> Wah wah wah. ${userAlias} failed catastrophically! (You rolled a \`${num}\`.)`;
				await interaction.channel.send(sadMessage).then((msg) => {
					msg.react('😢');
				});
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

		// Replace any dice that triggered an auto success with the letter S
		returnedNumbers.forEach((n, i) => {
			if (skip150) {
				// if it hits 150, it's an auto success, crit fails are not counted if skip150 is marked
				if ((i == 0 && criteria[i] + 50 >= 150) || criteria[i] >= 150) {
					rolledNumberString = rolledNumberString.replace(String(n), String(n) + ' (S)');
				}
			} else {
				// if it's a crit fail AND above 150 mag, then the success and crit fail cancel out, marked by an X
				// else if it's above 150 mag and not a crit fail, it's an auto success, marked by an S
				if (n >= 90 && ((i == 0 && criteria[i] + 50 >= 150) || criteria[i] >= 150)) {
					rolledNumberString = rolledNumberString.replace(String(n), String(n) + ' (X)');
				} else if (((i == 0 && criteria[i] + 50 >= 150) || criteria[i] >= 150) && n < 90) {
					rolledNumberString = rolledNumberString.replace(String(n), String(n) + ' (S)');
				}
			}
		});
		if (hasOver150) {
			resultString +=
				'\n\t*Any magnitude above 150 has been automatically added to successes, marked by an `S`.*';
			if (!skip150) {
				resultString +=
					'\n\t*Any magnitude above 150 which also rolled a crit fail has been cancelled out, marked by an `X`.*';
			}
		}

		if (criticalSuccesses > 0) {
			resultString += `\n\t*Gain ${criticalSuccesses} XP.* `;
		}
		if (criticalFailures > 0) {
			resultString += `\n\t*Note: Critical failures have been subtracted from the total number of successes.*`;
		}
		if (cancelledFailures > 0) {
			resultString += `\n\t*Note: Due to high threshold (100-150), or a sufficiently high threshold (it would have succeeded if not for the crit fail rolled), ${cancelledFailures} critical failure${cancelledFailures == 1 ? '' : 's'} ${cancelledFailures == 1 ? 'has' : 'have'} been negated.*`;
		}

		// Send final message to channel
		let finalMessage = `${userAlias} rolled... ${rolledNumberString} Result: ${resultString}`;
		let comment = interaction.options.getString('comment');
		if (comment) {
			finalMessage += `\n\nFor: \`${comment}\``;
		}
		let finalReply = await interaction.reply({content: finalMessage, fetchReply: true});
		if ((successes > 0 || criticalSuccesses > 0) && criticalFailures == 0) {
			finalReply.react('🎉');
		}
		if (criticalFailures > 0) {
			finalReply.react('752693741440991323');
		}
		if (successes == 0 && criticalSuccesses == 0) {
			finalReply.react('😢');
		}
	});
}

module.exports = {
	executeNormalDiceRoll,
	executeRankedSkillCheck,
	executeNuevoHuevoJuegoDiceRoll
};
