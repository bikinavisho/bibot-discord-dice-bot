// Logging utility - logs to console and saves to file

const fsPromises = require('fs').promises;

const LOG_DIRECTORY_PATH = './logs/';
const LOG_FILE_SUFFIX = '__log.txt';

fsPromises.mkdir(LOG_DIRECTORY_PATH).catch(() => {});

function log(...message) {
	const LOG_DATE = formatDate(new Date(Date.now()));

	let messageString = '';
	message.forEach((mess) => {
		messageString += mess;
	});

	console.log(messageString);
	fsPromises.appendFile(LOG_DIRECTORY_PATH + LOG_DATE + LOG_FILE_SUFFIX, messageString + '\n');
}

// Remove log files older than a week (7 days)
const LOG_RETENTION_IN_DAYS = 7;
function cleanupLogDirectory() {
	fsPromises.readdir(LOG_DIRECTORY_PATH).then((fileNames) => {
		let recentLogFileNames = []; // logs within the last 7 days
		let today = new Date(Date.now());
		for (let i = 0; i < LOG_RETENTION_IN_DAYS; i++) {
			let nextDate = new Date(today);
			nextDate.setDate(nextDate.getDate() + i);
			recentLogFileNames.push(formatDate(nextDate) + LOG_FILE_SUFFIX);
		}

		let filesDeleted = 0;
		fileNames.forEach((fileName) => {
			if (!recentLogFileNames.includes(fileName)) {
				fsPromises.unlink(LOG_DIRECTORY_PATH + fileName);
				filesDeleted++;
			}
		});

		setTimeout(() => {
			log('\n-------------------------------------');
			log('\tLOGGING FILE CLEANUP');
			log(`\t${filesDeleted} files deleted.`);
			log('-------------------------------------\n');
		}, 2 * 1000);
	});
}

function formatDate(date) {
	return date.toLocaleDateString('en', {timeZone: 'America/Monterrey'}).replace(/\//g, '-');
}

module.exports = {
	log,
	cleanupLogDirectory
};
