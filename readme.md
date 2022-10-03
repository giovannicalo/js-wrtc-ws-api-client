# JavaScript WebRTC WebSocket Signaling API Client

[![Build Status](https://github.com/giovannicalo/js-wrtc-ws-api-client/actions/workflows/build.yml/badge.svg)](https://github.com/giovannicalo/js-wrtc-ws-api-client/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/giovannicalo/js-wrtc-ws-api-client/badge.svg?branch=master)](https://coveralls.io/github/giovannicalo/js-wrtc-ws-api-client?branch=master)

## Installation

```bash
npm install giovannicalo/js-wrtc-ws-api-client
```

> Not yet published to NPM. This will install it from GitHub.

## Usage

```javascript
import Client from "wrtc-ws-api-client";

const client = new Client("ws://localhost:8080");

client.addEventListener("foo", ({ data: { bar } }) => {
    // Do something
});

client.send({ data: { bar: 42 }, event: "foo" });
```

## API

### `new Client(url: string, options?: Options)`

Creates a WebSocket client and uses it to connect to the server running at `url`. Extends [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget).

Options are:

* `getAuthenticationData?(): { [key: string]: JsonSerializable }`: a function that returns data required for authentication, e.g. a token, which will be sent to the server upon connection, defaults to `undefined`.
* `log?(level: string, message: string): void`: a logging function that will be called when certain events occur, defaults to `undefined`.
* `reconnectionInterval?: number`: the interval between reconnection attempts, in milliseconds, defaults to `1000`.
* `role?: string`: the client's role, which will be sent to the server upon connection, defaults to `client`.

#### `close(): void`

Permanently closes the connection.

#### `id: null | number | string`

The `Client`'s ID, returned by the server upon successful authentication.

#### `send(message: JsonSerializable): void`

Sends a `message` to the server.
