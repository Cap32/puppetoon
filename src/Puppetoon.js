
import Connection from './Connection';
import { signals } from 'signal-exit';
import Browser from './Browser';

export default class Puppetoon {
	static async connect(options = {}) {
		if (!options.url) {
			throw new Error('[Puppetoon.connect]: Missing `url`');
		}

		const connection = await Connection.create(options);
		const browser = new Browser(connection);

		process.on('exit', () => {
			connection.close();
		});

		if (options.handleSIGNALS !== false) {
			signals().forEach((signal) => {
				process.on(signal, async () => {
					if (browser) { await browser.close(); }
					process.exit(130);
				});
			});
		}

		return browser;
	}
}
