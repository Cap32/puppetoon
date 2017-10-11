
export default class Page {
	static async create(chrome, closePage) {
		const page = await chrome.newPage();
		return new Proxy({}, {
			get(target, method) {
				if (method === 'close') {
					return async function close() {
						await page.close();
						await closePage();
					};
				}
			}
		});
	}
}
