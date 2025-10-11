const {faker} = require('@faker-js/faker');
const caplitalize = require('lodash/capitalize');

const MOCK_INTERACTION = {
	member: {
		nickname: caplitalize(faker.color.human()) + caplitalize(faker.animal.type()).replaceAll(' ', '')
	},
	user: {
		username: faker.internet.username()
	},
	reply: createReplyMock(),
	options: {
		getInteger: jest.fn().mockReturnValue(faker.number.int({min: 1, max: 100})),
		getString: jest.fn().mockReturnValue(faker.string.alpha({min: 1, max: 15})),
		getBoolean: jest.fn().mockReturnValue(faker.datatype.boolean()),
		getSubcommand: jest.fn().mockReturnValue(faker.string.alpha({min: 1, max: 15}))
	},
	client: {
		channels: {
			fetch: jest.fn().mockResolvedValue({
				send: jest.fn().mockResolvedValue({})
			})
		}
	},
	fetchReply: createReplyMock()
};

function createReplyMock() {
	return jest.fn().mockResolvedValue({
		react: jest.fn()
	});
}

module.exports = {
	MOCK_INTERACTION
};
