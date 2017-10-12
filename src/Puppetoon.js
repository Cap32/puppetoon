
import APIServer from './APIServer';
import { signals } from 'signal-exit';
import Browser from './Browser';

export default class Puppetoon {
	static connect(options = {}) {
		if (!options.url) {
			throw new Error('[Puppetoon.connect]: Missing `url`');
		}

		const server = new APIServer(options);
		let browser;

		process.on('exit', () => {
			server.close();
			browser && browser.close();
		});

		if (options.handleSIGNALS !== false) {
			signals().forEach((signal) => {
				process.on(signal, process.exit);
			});
		}


		return new Promise((resolve) => {
			server.listen((api) => {
				browser = new Browser(server, api);
				resolve(browser);
			});
		});
	}
}
