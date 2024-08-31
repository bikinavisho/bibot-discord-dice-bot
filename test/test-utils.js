const MOCK_INTERACTION = {
	member: {
		nickname: ''
	},
	user: {
		username: ''
	},
	reply: jest.fn().mockResolvedValue({
		react: jest.fn()
	}),
	options: {
		getInteger: jest.fn(),
		getString: jest.fn()
	}
};

module.exports = {
	MOCK_INTERACTION
};
