# Tests — conventions and helpers

This file documents the small testing conventions and helpers used in this repo so tests stay predictable and easy to read.

## Key helpers provided

### Manual mock: `__mocks__/random-org.js`

Jest will automatically use this manual mock when you call `jest.mock('random-org')` in a test file.
The manual mock exposes a small helper API to control returned rolls and inspect the mocked instance.

API:

-   `RandomOrgMock.__setNextRoll(value)` — Set the next roll value. If the RandomOrg instance already exists (created at module load), the helper will directly set the instance's `generateIntegers` mock to resolve with `value`. Otherwise the value will be queued for the next created instance.
-   `RandomOrgMock.__getCurrentInstance()` — Return the last created mock instance (or `null`). Useful for inspecting `generateIntegers.mock` calls.

Example usage (top of a test file):

```js
jest.mock('random-org');
const RandomOrgMock = require('random-org');
const MyModule = require('../../src/my-module');
```

Setting a roll for a test:

```js
// If your code created its RandomOrg instance at require() time, set it like this:
RandomOrgMock.__setNextRoll(1);

// run module code that triggers generateIntegers
await MyModule.doTheThing();
```

Note: In this codebase `src/commands/heresy.js` creates a `RandomOrg` instance at module load time. That means you can call `RandomOrgMock.__setNextRoll()` after requiring the module to change that instance's behaviour. If you change production code so the instance is created per-call, prefer controlling the instance via `__getCurrentInstance()` and calling `__setNextRoll()` on it, or adjust the mock accordingly.

---

### Global test setup: `test/jest.setup.js`

This project replaces console methods with jest spies by default so tests don't spam the output while still allowing assertions against `console.log` etc.

The setup exposes helpers on `global`:

-   `global.__restoreConsole()` — restore real console methods (prints to stdout/stderr)
-   `global.__mockConsole()` — re-mock console methods (jest.fn())

Use these in a specific test when you need to see actual output, for example:

```js
test('debug prints to stdout', () => {
	global.__restoreConsole();
	// run code that logs
	global.__mockConsole();
});
```

Otherwise you can assert against the spy:

```js
expect(console.log).toHaveBeenCalled();
expect(console.log).toHaveBeenCalledWith('some message');
```

---

### Test utilities: `test/test-utils.js`

A tiny helper that exports `MOCK_INTERACTION` used by many command tests. It contains a mocked `reply` that resolves to an object with `react` mocked as well, and `options.getInteger`/`getString` which tests can override.

Quick pattern:

```js
const {MOCK_INTERACTION} = require('../test-utils');
let mock = {...MOCK_INTERACTION};
mock.options = {getInteger: jest.fn((name) => (name === 'target' ? 50 : 0))};
await myCommand.execute(mock);
expect(mock.reply).toHaveBeenCalled();
```

---

## Running tests

Run the project's tests using the local jest binary so the manual mocks are picked up:

```bash
# run all tests
npx jest --color --verbose

# run a single test file
npx jest "test/commands/heresy.test.js" --color --verbose
```

---

## Recommendations

-   Prefer using the manual mock helpers instead of editing mock instances directly. It makes intent clearer and centralizes mock state.
-   In this project, the code creates the instance at module-load time, so `__setNextRoll()` should be called in the test.
-   Keep tests deterministic: always set the roll values you depend on rather than relying on defaults.
