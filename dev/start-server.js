const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const getNetwork = require('./get-network');

const projectRoot = path.resolve(__dirname, '..');

const CONTENT_TYPES = Object.freeze({
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.zip': 'application/zip',
});

function applyHeaders(response) {
  response.setHeader('Access-Control-Allow-Headers', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.setHeader('Expires', '0');
  response.setHeader('Pragma', 'no-cache');
}

function createRequestHandler(rootDir = projectRoot) {
  const absoluteRoot = path.resolve(rootDir);
  return async (request, response) => {
    applyHeaders(response);
    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD, OPTIONS' });
      response.end('Method not allowed.');
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400);
      response.end('Invalid request path.');
      return;
    }
    const filePath = path.resolve(absoluteRoot, `.${pathname}`);
    if (filePath !== absoluteRoot && !filePath.startsWith(`${absoluteRoot}${path.sep}`)) {
      response.writeHead(403);
      response.end('Forbidden.');
      return;
    }

    try {
      const stat = await fs.promises.stat(filePath);
      if (!stat.isFile()) throw Object.assign(new Error('Not a file.'), { code: 'ENOENT' });
      response.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': CONTENT_TYPES[path.extname(filePath).toLowerCase()] ||
          'application/octet-stream',
      });
      if (request.method === 'HEAD') {
        response.end();
        return;
      }
      fs.createReadStream(filePath).pipe(response);
    } catch (error) {
      if (error?.code !== 'ENOENT') console.error(error);
      if (!response.headersSent) response.writeHead(404);
      response.end('Not found.');
    }
  };
}

function startServer({
  host,
  port,
  rootDir = projectRoot,
  createServer = http.createServer,
} = {}) {
  const server = createServer(createRequestHandler(rootDir));

  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve(server);
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
}

async function closeServer(server) {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function main({ logger = console, runtime = process } = {}) {
  const { ip: host, port } = await getNetwork();
  const server = await startServer({ host, port });
  const address = server.address();
  const url = `http://${host}:${address.port}/dist.zip`;
  logger.log(`Plugin archive available at ${url}`);
  runtime.send?.({ status: 'ready', type: 'server', url });

  let closing = false;
  const shutdown = async (exitCode) => {
    if (closing) return;
    closing = true;
    try {
      await closeServer(server);
      runtime.exitCode = exitCode;
    } catch (error) {
      logger.error(error);
      runtime.exitCode = 1;
    }
  };

  runtime.once('SIGINT', () => void shutdown(130));
  runtime.once('SIGTERM', () => void shutdown(143));
  return { server, shutdown, url };
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  closeServer,
  createRequestHandler,
  main,
  startServer,
};
