const {faker} = require('@faker-js/faker');

let _queuedRolls = [];

function RandomOrg(options) {
	this.apiKey = options?.apiKey;

	// Determine the default roll for this instance: use queued value if present, otherwise 1
	const defaultRoll = _queuedRolls.length ? _queuedRolls.shift() : faker.number.int({min: 1, max: 100});

	this.generateIntegers = jest.fn().mockResolvedValue({random: {data: [defaultRoll]}});
	this.generateIntegerSequences = jest.fn().mockResolvedValue({random: {data: [[defaultRoll]]}});

	// Track the last created instance for tests to inspect if needed
	RandomOrg.__currentInstance = this;
}

// Helper: last created mock instance
RandomOrg.__currentInstance = null;

// Helper: set the next call's returned roll. If an instance already exists, set it directly,
// otherwise queue it so the next created instance will use it.
RandomOrg.__setNextRoll = (value) => {
	if (RandomOrg.__currentInstance) {
		RandomOrg.__currentInstance.generateIntegers.mockResolvedValue({random: {data: [value]}});
	} else {
		_queuedRolls.push(value);
	}
};

// Helper: return the last created instance (or null)
RandomOrg.__getCurrentInstance = () => RandomOrg.__currentInstance;

// Note: There will only ever be one instance of RandomOrg since it's
// initiated at module load time.

module.exports = RandomOrg;
