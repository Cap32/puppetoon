
export default class Page {
	static async create(chrome, closePage) {
		const page = await chrome.newPage();
		return new Proxy({}, {
			get(target, method) {
				if (method === 'close') {
					return async function close() {
						if (!page._client._connection) { return; }
						await page.close();
						await closePage();
					};
				}
				return page[method];
			}
		});
	}
}
