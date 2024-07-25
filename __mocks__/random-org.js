function RandomOrg(o) {
	this.apiKey = o?.apiKey;
	this.generateIntegers = jest.fn().mockResolvedValue({
		random: {
			data: []
		}
	});
}

module.exports = RandomOrg;
