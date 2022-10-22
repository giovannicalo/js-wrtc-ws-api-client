const WebSocket = require("ws");

const Client = require(".");

jest.mock("ws", () => {
	const close = jest.fn();
	const listeners = {};
	let mockReadyState = 0;
	const send = jest.fn();
	return jest.fn().mockImplementation(() => {
		return {
			OPEN: 1,
			addEventListener(event, listener) {
				listeners[event] = [
					...listeners[event] || [],
					listener
				];
			},
			close,
			emit(event, data) {
				for (const listener of listeners[event] || []) {
					listener(data);
				}
			},
			get readyState() {
				return mockReadyState;
			},
			set readyState(value) {
				mockReadyState = value;
			},
			removeEventListener() {
				// Do nothing
			},
			removeEventListeners() {
				for (const listener in listeners) {
					if (listeners.hasOwnProperty(listener)) {
						delete listeners[listener];
					}
				}
			},
			send
		};
	});
});

beforeEach(() => {
	jest.clearAllMocks();
	WebSocket().readyState = 0;
	WebSocket().removeEventListeners();
});

it("should connect to the given server", () => {
	new Client("ws://localhost:8080"); // eslint-disable-line no-new
	expect(WebSocket).toHaveBeenCalledTimes(3);
	expect(WebSocket).toHaveBeenCalledWith("ws://localhost:8080");
});

it("should authenticate upon connection", () => {
	const client = new Client("ws://localhost:8080");
	const send = jest.spyOn(client, "send");
	WebSocket().readyState = 1;
	WebSocket().emit("open");
	expect(send).toHaveBeenCalledTimes(1);
	expect(send).toHaveBeenCalledWith({
		data: { role: "client" },
		event: "handshake"
	});
});

it("should authenticate with the given role", () => {
	const client = new Client("ws://localhost:8080", { role: "server" });
	const send = jest.spyOn(client, "send");
	WebSocket().readyState = 1;
	WebSocket().emit("open");
	expect(send).toHaveBeenCalledTimes(1);
	expect(send).toHaveBeenCalledWith({
		data: { role: "server" },
		event: "handshake"
	});
});

it("should authenticate with the given data", () => {
	const client = new Client("ws://localhost:8080", {
		getAuthenticationData() {
			return { foo: "bar" };
		}
	});
	const send = jest.spyOn(client, "send");
	WebSocket().readyState = 1;
	WebSocket().emit("open");
	expect(send).toHaveBeenCalledTimes(1);
	expect(send).toHaveBeenCalledWith({
		data: { foo: "bar", role: "client" },
		event: "handshake"
	});
});

it("should queue messages while disconnected and send them upon connection", () => {
	const client = new Client("ws://localhost:8080");
	const send = WebSocket().send;
	client.send({ event: "test" });
	expect(send).not.toHaveBeenCalled();
	WebSocket().readyState = 1;
	WebSocket().emit("open");
	expect(send).toHaveBeenCalledTimes(2);
	expect(send).toHaveBeenCalledWith(JSON.stringify({ event: "test" }));
});

it("should have an ID after receiving a handshake event", () => {
	const client = new Client("ws://localhost:8080");
	WebSocket().emit("message", {
		data: JSON.stringify({
			data: { id: 42 },
			event: "handshake"
		})
	});
	expect(client.id).toBe(42);
});

it("should send the given message to the server", () => {
	const client = new Client("ws://localhost:8080");
	WebSocket().readyState = 1;
	client.send({ event: "foo" });
	expect(WebSocket().send).toHaveBeenCalledWith(JSON.stringify({ event: "foo" }));
});

it("should run the given event handler when the related event occurs", () => {
	const client = new Client("ws://localhost:8080");
	const handler = jest.fn();
	client.addEventListener("foo", handler);
	WebSocket().emit("message", {
		data: JSON.stringify({
			data: "bar",
			event: "foo"
		})
	});
	expect(handler).toHaveBeenCalledWith(expect.objectContaining({ data: "bar" }));
});

it("should reconnect upon disconnection", () => {
	new Client("ws://localhost:8080"); // eslint-disable-line no-new
	expect(WebSocket).toHaveBeenCalledTimes(3);
	jest.useFakeTimers();
	WebSocket().emit("close");
	jest.advanceTimersByTime(1000);
	expect(WebSocket).toHaveBeenCalledTimes(5);
	jest.useRealTimers();
});

it("should reconnect after the given interval", () => {
	new Client("ws://localhost:8080", { // eslint-disable-line no-new
		reconnectionInterval: 5000
	});
	expect(WebSocket).toHaveBeenCalledTimes(3);
	jest.useFakeTimers();
	WebSocket().emit("close");
	jest.advanceTimersByTime(1000);
	expect(WebSocket).toHaveBeenCalledTimes(4);
	jest.advanceTimersByTime(5000);
	expect(WebSocket).toHaveBeenCalledTimes(5);
	jest.useRealTimers();
});

it("should close the connection", () => {
	const client = new Client("ws://localhost:8080");
	client.close();
	expect(WebSocket().close).toHaveBeenCalledWith();
});

it("should use the given logger", () => {
	const log = jest.fn();
	const client = new Client("ws://localhost:8080", { log });
	WebSocket().readyState = 1;
	WebSocket().emit("open");
	expect(log).toHaveBeenCalledWith("info", "Connected");
	WebSocket().emit("message", {
		data: JSON.stringify({
			data: { id: 42 },
			event: "handshake"
		})
	});
	expect(log).toHaveBeenCalledWith("info", "Authenticated with ID 42");
	WebSocket().emit("error", { error: "Something went wrong" });
	expect(log).toHaveBeenCalledWith("error", "Something went wrong");
	client.close();
	expect(log).toHaveBeenCalledWith("info", "Disconnected");
});
