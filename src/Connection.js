
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
		const callbacks = {};

		this.send = (type, payload) => {
			return new Promise((resolve, reject) => {
				const _id = uuid();
				callbacks[_id] = (res) => {
					Reflect.deleteProperty(callbacks, _id);
					if (res.error) { reject(res); }
					else { resolve(res); }
				};
				this._ws.send(JSON.stringify({ _id, type, payload }));
			});
		};

		this.on(EventType, (_id, payload) => {
			if (callbacks[_id]) {
				callbacks[_id](payload);
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
