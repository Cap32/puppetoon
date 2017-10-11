
import APIServer from './APIServer';
import { signals } from 'signal-exit';
import Browser from './Browser';

process.on('unhandledRejection', (r) => console.log(r));

export default class Puppetoon {
	static connect(options = {}) {
		if (!options.url) {
			throw new Error('[Puppetoon.connect]: Missing `url`');
		}

		const server = new APIServer(options);

		process.on('exit', () => {
			server.close();
		});

		signals().forEach((signal) => {
			process.on(signal, process.exit);
		});

		return new Promise((resolve) => {
			server.listen((api) => {
				const browser = new Browser(server, api);
				resolve(browser);
			});
		});
	}
}
