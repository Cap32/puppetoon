
import Puppetoon from '../src/Puppetoon';
import delay from 'delay';

(async function main() {
	const browser = await Puppetoon.connect({
		url: 'ws://127.0.0.1:8808',
	});
	const page = await browser.newPage();
	console.log('page created');
	await page.close();
	await browser.close();
}());
