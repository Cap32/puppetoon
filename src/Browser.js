
import Puppeteer from 'puppeteer';
import Page from './Page';

export default class Browser {
	constructor(connection) {
		this._connection = connection;
		this._pages = {};
		this._chrome = null;
	}

	async newPage(options) {
		const { id, wsEndpoint } = await this._connection.send('newPage', options);
		const chrome = this._chrome ||
			(this._chrome = await Puppeteer.connect({
				browserWSEndpoint: wsEndpoint,
			}))
		;
		const page = await Page.create(chrome, async () => {
			Reflect.deleteProperty(this._pages, id);
			return this._connection.send('closePage', { id });
		});
		this._pages[id] = page;
		return page;
	}

	async close() {
		await Promise.all(Object.keys(this._pages).map((id) => {
			const page = this._pages[id];
			return page && page.close();
		}));
		this._connection.close();
		this._chrome && this._chrome.close();
	}

	async runInPage(fn, options = {}) {
		const { maxTry = 3, ...pageOptions } = options;
		if (maxTry < 1) { throw new Error('maxTry must large than 0'); }
		const errors = [];
		for (let index = 0; index < maxTry; index++) {
			let page;
			try {
				page = await this.newPage(pageOptions);
				const res = await fn(page, index);
				await page.close();
				return res;
			}
			catch (err) {
				errors.push(err);
				if (page) { await page.close().catch(() => {}); }
			}
		}
		const error = errors[errors.length - 1];
		error.errors = errors;
		throw error;
	}

	async version() {
		return this._connection.send('version');
	}

	async getQueueSize() {
		return this._connection.send('getQueueSize');
	}
}
