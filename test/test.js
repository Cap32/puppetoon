
import Puppetoon from '../src/Puppetoon';
// const Puppetoon = require('puppetoon');

(async function main() {
	let browser;
	try {
		browser = await Puppetoon.connect({
			url: 'ws://127.0.0.1:8808',
		});

		const { version } = await browser.version();
		console.log('version', version);

		const page = await browser.newPage();
		console.log('page created');

		const { size } = await browser.getQueueSize();
		console.log('queue size', size);

		await page.close();
		console.log('page closed');

		await browser.runInPage(async (page, index) => {
			if (index < 2) { throw new Error('you suck'); }
			// await page.close();
			return 'ok';
		});

		await browser.close();
		console.log('browser closed');
	}
	catch (err) {
		await browser.close().catch(() => {});
		console.error(err);
	}
}());
