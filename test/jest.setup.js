/* eslint-env jest */
// Jest setup file: silence console.log (and other console methods) during tests

// Preserve originals
global.__ORIG_CONSOLE__ = {
	log: console.log,
	error: console.error,
	warn: console.warn,
	info: console.info,
	debug: console.debug
};

// By default, replace console methods with jest spies so tests don't spam output
beforeEach(() => {
	console.log = jest.fn();
	console.error = jest.fn();
	console.warn = jest.fn();
	console.info = jest.fn();
	console.debug = jest.fn();
});

// Provide a helper to restore real console in a test if necessary
afterAll(() => {
	console.log = global.__ORIG_CONSOLE__.log;
	console.error = global.__ORIG_CONSOLE__.error;
	console.warn = global.__ORIG_CONSOLE__.warn;
	console.info = global.__ORIG_CONSOLE__.info;
	console.debug = global.__ORIG_CONSOLE__.debug;
});

// Optional: expose a small helper to tests to restore the real console temporarily
global.__restoreConsole = () => {
	console.log = global.__ORIG_CONSOLE__.log;
	console.error = global.__ORIG_CONSOLE__.error;
	console.warn = global.__ORIG_CONSOLE__.warn;
	console.info = global.__ORIG_CONSOLE__.info;
	console.debug = global.__ORIG_CONSOLE__.debug;
};

// And a helper to re-mock after using real console
global.__mockConsole = () => {
	console.log = jest.fn();
	console.error = jest.fn();
	console.warn = jest.fn();
	console.info = jest.fn();
	console.debug = jest.fn();
};
