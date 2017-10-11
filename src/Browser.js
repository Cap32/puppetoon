
import Puppeteer from 'puppeteer';
import Page from './Page';

export default class Browser {
	constructor(server, api) {
		this._server = server;
		this._api = api;
		this._pages = {};
		this._chrome = null;
	}

	async newPage(options) {
		const { id, wsEndpoint } = await this._api.newPage(options);
		const chrome = this._chrome ||
			(this._chrome = await Puppeteer.connect({
				browserWSEndpoint: wsEndpoint,
			}))
		;
		const page = await Page.create(chrome, async () => {
			Reflect.deleteProperty(this._pages, id);
			return this._api.closePage({ id });
		});
		this._pages[id] = page;
		return page;
	}

	async close() {
		await Promise.all(Object.keys(this._pages).map((id) => {
			const page = this._pages[id];
			return page.close();
		}));
		this._server.close();
		this._chrome && this._chrome.close();
	}

	async version() {
		return this._api.version();
	}

	async getQueueSize() {
		return this._api.getQueueSize();
	}
}
