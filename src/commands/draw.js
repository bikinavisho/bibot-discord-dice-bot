const {SlashCommandBuilder} = require('discord.js');
const _ = require('lodash');
const RandomOrg = require('random-org');

const {log} = require('../logging-util.js');
const {DECK_OF_CARDS, JOKER_CARDS} = require('../utility-functions/card-functions.js');

// enable the use of environemnt files (.env)
require('dotenv').config();

const random = new RandomOrg({apiKey: process.env.RANDOM_API_KEY});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('draw')
		.setDescription('Draws cards at random from a standard deck of cards.')
		.addIntegerOption((option) =>
			option
				.setName('number_of_cards')
				.setDescription('The number of cards to draw from the deck.')
				.setMinValue(1)
				.setRequired(false)
		)
		.addBooleanOption((option) =>
			option
				.setName('has_jokers')
				.setDescription('Whether or not to include Jokers in the deck.')
				.setRequired(false)
		),
	async execute(interaction) {
		const userAlias =
			interaction.member && interaction.member.nickname ? interaction.member.nickname : interaction.user.username;

		let numberOfCards = interaction.options.getInteger('number_of_cards') ?? 1;
		let hasJokers = interaction.options.getBoolean('has_jokers') ?? true;

		log(`drawing ${numberOfCards} cards with${hasJokers === false ? 'out' : ''} Jokers`);

		let deckOfCards = [...DECK_OF_CARDS];
		if (hasJokers) {
			deckOfCards = _.concat(deckOfCards, JOKER_CARDS);
		}

		let randomConfig = {
			min: 1,
			max: deckOfCards.length,
			n: 1,
			length: numberOfCards,
			replacement: false
		};

		await random.generateIntegerSequences(randomConfig).then(async (result) => {
			// expected result: [[1, 2, 3...]] with length of length/numberOfCards
			let cardsDrawnRaw = result?.random?.data[0];
			log('randomOrg results: ', cardsDrawnRaw);
			// translate 1-52 into 0-51 which is the array index of our deck of cards
			let cardsDrawn = cardsDrawnRaw.map((number) => deckOfCards[Number(number) - 1]);
			log('cards drawn: ', cardsDrawn);
			// format message for the user ~
			let cardsDrawnMessage = `${userAlias} drew ${numberOfCards} card${numberOfCards == 1 ? '' : 's'}: \`[${String(cardsDrawn).replace(/,/g, ', ')}]\``;
			// send ~
			await interaction.reply(cardsDrawnMessage);
		});
	}
};
