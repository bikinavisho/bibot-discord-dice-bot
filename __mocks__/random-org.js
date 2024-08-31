function RandomOrg(o) {
	this.apiKey = o?.apiKey;
	this.generateIntegers = jest.fn().mockResolvedValue({
		random: {
			data: [1, 2, 3, 4, 5]
		}
	});
}

module.exports = RandomOrg;
