
import EventEmitter from 'events';
import WebSocket from 'ws';
import uuid from 'uuid/v4';

const EventType = 'CALL';

export default class Connection extends EventEmitter {
	static create(options) {
		return new Promise((resolve, reject) => {
			const connection = new Connection(options, (err) => {
				if (err) { reject(err); }
				else { resolve(connection); }
			});
		});
	}

	constructor(options, callback) {
		super();

		const ws = this._ws = new WebSocket(options.url);
		const callbacks = new Map();

		this.send = (type, payload) => {
			return new Promise((resolve, reject) => {
				const _id = uuid();

				callbacks.set(_id, (res) => {
					callbacks.delete(_id);
					if (res.error) { reject(res); }
					else { resolve(res); }
				});

				this._ws.send(JSON.stringify({ _id, type, payload }));
			});
		};

		this.on(EventType, (_id, payload) => {
			if (callbacks.has(_id)) {
				const handler = callbacks.get(_id);
				handler(payload);
			}
		});

		ws.on('message', (message) => {
			try {
				const { _id, payload } = JSON.parse(message);
				if (!_id) { throw new Error('Missing _id'); }
				this.emit(EventType, _id, payload);
			}
			catch (err) {
				console.error('Invalid message', err);
			}
		});

		ws.on('open', callback);
		ws.on('error', callback);
	}

	close() {
		this._ws && this._ws.terminate();
	}
}
