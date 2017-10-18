
import Puppetoon from '../src/Puppetoon';
// const Puppetoon = require('puppetoon');
import delay from 'delay';

(async function main() {
	let browser;
	try {
		browser = await Puppetoon.connect({
			url: 'ws://127.0.0.1:8808/test',
		});

		const { version } = await browser.version();
		console.log('version', version);

		const page = await browser.newPage();
		console.log('page created');

		await page.goto('https://baidu.com');
		console.log('page title', await page.title());

		await Promise.all(new Array(3).fill().map(async () => {
			const { size } = await browser.getQueueSize();
			console.log('queue size', size);
		}));

		await delay(2000);

		await page.close();
		console.log('page closed');

		const result = await browser.runInPage(async (page, index) => {
			await delay(1000);
			if (index < 2) { throw new Error('you suck'); }
			await page.close();
			return 'ok';
		});
		console.log('runInPage', result);

		await browser.close();
		console.log('browser closed');
	}
	catch (err) {
		await browser.close().catch(() => {});
		console.error(err);
	}
}());
