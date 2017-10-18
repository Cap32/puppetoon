
import Puppeteer from 'puppeteer';
import Page from './Page';

class Chunk {
	constructor(wsEndpoint) {
		this._wsEndpoint = wsEndpoint;
	}

	async browser() {
		return Puppeteer.connect({
			browserWSEndpoint: this._wsEndpoint,
		});
	}
}

export default class Browser {
	constructor(connection) {
		this._connection = connection;
		this._pages = new Set();
		this._chunks = new Map();
	}

	async newPage(options) {
		const {
			targetId, wsEndpoint,
		} = await this._connection.send('newPage', options);

		let chunk;

		if (this._chunks.has(wsEndpoint)) {
			chunk = this._chunks.get(wsEndpoint);
		}
		else {
			chunk = new Chunk(wsEndpoint);
			this._chunks.set(wsEndpoint, chunk);
		}

		const browser = await chunk.browser();
		const page = await Page.create(browser, targetId, async () => {
			this._pages.delete(page);
			return this._connection.send('closePage', { targetId });
		});
		this._pages.add(page);
		return page;
	}

	async close() {
		const promises = [];
		for (const page of this._pages) {
			promises.push(page.close.bind(page));
		}
		await Promise.all(promises);
		this._pages.clear();
		this._chunks.clear();
		this._connection.close();
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
