export interface AppHttpRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PROPFIND' | 'REPORT';
  headers?: Record<string, string>;
  body?: any;
}

export type AppHttpResponse = {
  status: number;
  data: any;
  headers: Record<string, string>;
  errorMessage: string;
};

const HTTP_STATUS_TITLES: Record<number, string> = {
  400: '400 Bad Request',
  401: '401 Unauthorized',
  403: '403 Forbidden',
  404: '404 Not Found',
  500: '500 Internal Server Error',
  502: '502 refused connection or is not available.'

};

export const PlatformHttpClient = {
  async request({ url, method = 'GET', headers = {}, body }: AppHttpRequest) {
    try {
      const response = await nodeRequest(url, method, body, headers);
      return {
        ...response,
        errorMessage: HTTP_STATUS_TITLES[response.status]? HTTP_STATUS_TITLES[response.status] : ''
      };

    } catch (err: any) {
      if(err.code &&
        [ "ECONNREFUSED",
          "ETIMEDOUT",
          "ENOTFOUND",
          "ECONNRESET",
        ].includes(err.code)) {
        return {
          status: 502,
          data: '',
          headers: {},
          errorMessage: HTTP_STATUS_TITLES[502]
        };
      }
      return {
        status: 500,
        data: '',
        headers: {},
        errorMessage: HTTP_STATUS_TITLES[500]
      };
    }
  }
};


interface ErrnoException extends Error {
  code?: string;
}

async function nodeRequest(
  url: string,
  method = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): Promise<AppHttpResponse> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { URL } = require('url');
  const parsedUrl = new URL(url);
  const protocol = parsedUrl.protocol === 'https:' ? 'node:https' : 'node:http';
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const client = require(protocol);

  return new Promise((resolve, reject) => {
    const options = {
      method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      headers,
    };

    const req = client.request(options, (res: any) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          data,
          headers: res.headers,
          errorMessage: ''
        });
      });
    });

    req.on('error', (err: ErrnoException) => {
      reject(err);
    });

    if (body) {
      if (typeof body === 'object' && !Buffer.isBuffer(body)) {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}
