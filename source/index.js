// eslint-disable-next-line no-eval
const WebSocket = global.WebSocket || eval("require")("ws");

class Client extends EventTarget {

	#getAuthenticationData = null;

	#id = null;

	#log = null;

	#queue = [];

	#reconnectionInterval = null;

	#role = null;

	#socket = null;

	#url = null;

	constructor(url, {
		getAuthenticationData,
		log,
		reconnectionInterval,
		role
	} = {}) {
		super();
		this.#getAuthenticationData = getAuthenticationData;
		this.#log = log;
		this.#reconnectionInterval = reconnectionInterval ?? 1000;
		this.#role = role ?? "client";
		this.#url = url;
		this.#connect();
	}

	#authenticate = () => {
		this.#log?.("info", "Connected");
		this.send({
			data: {
				role: this.#role,
				...this.#getAuthenticationData?.()
			},
			event: "handshake"
		});
		while (this.#queue.length) {
			this.#send(this.#queue.shift());
		}
	};

	close = () => {
		this.#socket.removeEventListener("close", this.#reconnect);
		this.#socket.close();
		this.#log?.("info", "Disconnected");
	};

	#connect = () => {
		this.#socket = new WebSocket(this.#url);
		this.#socket.addEventListener("close", this.#reconnect);
		this.#socket.addEventListener("error", this.#handleError);
		this.#socket.addEventListener("message", this.#handleMessage);
		this.#socket.addEventListener("open", this.#authenticate);
	};

	#handleError = ({ error }) => {
		this.#log?.("error", error);
	};

	#handleMessage = (message) => {
		const { data, event: type, id } = JSON.parse(message.data);
		if (type === "handshake") {
			this.#id = data.id;
			this.#log?.("info", `Authenticated with ID ${this.#id}`);
		}
		const event = new Event(type);
		event.data = data;
		event.id = id;
		this.dispatchEvent(event);
	};

	get id() {
		return this.#id;
	}

	get #isConnected() {
		return this.#socket.readyState === this.#socket.OPEN;
	}

	#reconnect = () => {
		setTimeout(this.#connect, this.#reconnectionInterval);
	};

	#send = (message) => {
		if (this.#isConnected) {
			this.#socket.send(JSON.stringify(message));
		} else {
			this.#queue.push(message);
		}
	};

	send = (message) => {
		this.#send(message);
	};

}

module.exports = Client;
