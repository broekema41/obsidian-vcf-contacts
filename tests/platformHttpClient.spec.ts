import * as http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PlatformHttpClient } from "src/util/platformHttpClient";

type ReceivedRequest = {
  headers: http.IncomingHttpHeaders;
  body: string;
};

let server: http.Server;
let baseUrl: string;
let lastRequest: ReceivedRequest | undefined;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => (body += chunk));
    req.on('end', () => {
      lastRequest = { headers: req.headers, body };

      // error scenario passthrew test
      if (req.url === '/unauthorized') {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('Authentication required');
        return;
      }

      // Simulate a connection reset triggering catch scenario
      if (req.url === '/connection-reset') {
        req.socket.destroy();
        return;
      }

      res.writeHead(207);
      res.end();
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

describe('PlatformHttpClient request body', () => {
  it('sends a Content-Length instead of chunked encoding for string bodies', async () => {
    const body = '<?xml version="1.0"?><C:addressbook-query xmlns:C="urn:ietf:params:xml:ns:carddav"/>';

    await PlatformHttpClient.request({ url: baseUrl, method: 'REPORT', body });

    expect(lastRequest?.headers['transfer-encoding']).toBeUndefined();
    expect(lastRequest?.headers['content-length']).toBe(String(Buffer.byteLength(body)));
    expect(lastRequest?.body).toBe(body);
  });

  it('counts bytes, not characters, for non-ascii bodies', async () => {
    const body = 'FN:Zoë Ünal';

    await PlatformHttpClient.request({ url: baseUrl, method: 'PUT', body });

    expect(lastRequest?.headers['content-length']).toBe(String(Buffer.byteLength(body)));
    expect(lastRequest?.body).toBe(body);
  });

  it('sends a Content-Length for JSON object bodies', async () => {
    const body = { hello: 'world' };

    await PlatformHttpClient.request({ url: baseUrl, method: 'POST', body });

    expect(lastRequest?.headers['content-length']).toBe(String(Buffer.byteLength(JSON.stringify(body))));
    expect(lastRequest?.body).toBe(JSON.stringify(body));
  });

  it('does not add a Content-Length when there is no body', async () => {
    await PlatformHttpClient.request({ url: baseUrl, method: 'GET' });

    expect(lastRequest?.headers['content-length']).toBeUndefined();
  });

  it('maps HTTP errors and preserves the original response', async () => {
    const response = await PlatformHttpClient.request({
      url: `${baseUrl}unauthorized`
    });

    expect(response.status).toBe(401);
    expect(response.errorMessage).toBe('401 Unauthorized');
    expect(response.data).toBe('Authentication required');
    expect(response.headers['content-type']).toBe('text/plain');
  });

  it('maps connection errors to a understandable response', async () => {
    const response = await PlatformHttpClient.request({
      url: `${baseUrl}connection-reset`,
    });

    expect(response.status).toBe(502);
    expect(response.errorMessage).toBe(
      '502 refused connection or is not available.'
    );
    expect(response.data).toBe('');
    expect(response.headers).toEqual({});
  });

});
