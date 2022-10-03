type JsonSerializable = JsonSerializable[] | {
	[key: string]: JsonSerializable
} | boolean | null | number | string | undefined;

type Options = {
	getAuthenticationData?(): {
		[key: string]: JsonSerializable
	};
	log?(level: string, message: string): void;
	reconnectionInterval?: number;
	role?: string;
};

declare class Client extends EventTarget {

	/**
	 * Creates a new WebRTC WebSocket signaling API client.
	 *
	 * @param {String} url - The WebSocket server URL.
	 * @param {Options} [options] - The options object.
	 * @param {Function} [options.getAuthenticationData] - A function that returns data to be sent to the server for authentication.
	 * @param {Function} [options.log] - A function that logs messages.
	 * @param {Number} [options.reconnectionInterval=1000] - The interval between reconnection attempts, in milliseconds, defaults to 1000.
	 * @param {String} [options.role="client"] - The client's role, defaults to "client".
	 */
	constructor(url: string, options?: Options);

	/**
	 * Closes the connection.
	 *
	 * @returns {void}
	 */
	close(): void;

	/**
	 * The client's ID.
	 */
	get id(): null | number | string;

	/**
	 * Sends a message to the server.
	 *
	 * @param {JsonSerializable} message - The message to send.
	 * @returns {void}
	 */
	send(message: JsonSerializable): void;

}

export = Client;
