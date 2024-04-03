const SPADES = ['♤A', '♤2', '♤3', '♤4', '♤5', '♤6', '♤7', '♤8', '♤9', '♤10', '♤J', '♤Q', '♤K'];
const HEARTS = ['♡A', '♡2', '♡3', '♡4', '♡5', '♡6', '♡7', '♡8', '♡9', '♡10', '♡J', '♡Q', '♡K'];
const DIAMONDS = ['♢A', '♢2', '♢3', '♢4', '♢5', '♢6', '♢7', '♢8', '♢9', '♢10', '♢J', '♢Q', '♢K'];
const CLUBS = ['♧A', '♧2', '♧3', '♧4', '♧5', '♧6', '♧7', '♧8', '♧9', '♧10', '♧J', '♧Q', '♧K'];

const DECK_OF_CARDS = [...SPADES, ...HEARTS, ...DIAMONDS, ...CLUBS];
const JOKER_CARDS = ['🃟Joker', '🂿Joker'];
// STRING.AT(0) for suit
// STRING.AT(1) for number

module.exports = {
	DECK_OF_CARDS,
	JOKER_CARDS
};

/* the below function was used to generate the deck of cards constant declared above 
function createDeckOfCardsArray() {
	let a = [];
	for (let i = 0; i < 4; i++) {
		let cardSuit = '';
		switch (i) {
			case 0:
				cardSuit = '♤';
				break;
			case 1:
				cardSuit = '♡';
				break;
			case 2:
				cardSuit = '♢';
				break;
			case 3:
				cardSuit = '♧';
				break;
		}
		for (let j = 0; j < 13; j++) {
			if (j == 0) {
				a.push(cardSuit + 'A');
			} else if (j < 10) {
				a.push(cardSuit + String(j + 1));
			} else {
				switch (j) {
					case 10:
						a.push(cardSuit + 'J');
						break;
					case 11:
						a.push(cardSuit + 'Q');
						break;
					case 12:
						a.push(cardSuit + 'K');
						break;
				}
			}
		}
	}

	return a;
}
*/
