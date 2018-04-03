import PuppeteerPage from 'puppeteer/lib/Page';

export default class Page {
	static async create(browser, targetId, closePage) {
		// NOTE: uesing some internal properties from puppeteer Browser
		const client = await browser._connection.createSession(targetId);
		const page = await PuppeteerPage.create(
			client,
			browser._ignoreHTTPSErrors,
			browser._appMode,
			browser._screenshotTaskQueue
		);

		return new Proxy(page, {
			...Reflect,
			get(target, method) {
				if (method === 'close') {
					return async function close() {
						if (!browser._connection) {
							return;
						}
						return closePage();
					};
				}
				return page[method];
			}
		});
	}
}
