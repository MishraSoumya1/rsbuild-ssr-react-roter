import express from 'express';
import fs from 'node:fs';
import { createRsbuild, loadConfig, logger } from '@rsbuild/core';

const templateHtml = fs.readFileSync('./template.html', 'utf-8');
let manifest;

const serverRender = (serverAPI) => async (req, res) => {
  const indexModule = await serverAPI.environments.ssr.loadBundle('index');

  const url = req.originalUrl || '/';
  const data = req.method === 'POST' ? req.body : {};

  const markup = indexModule.renderAppToString(url, data);

  const { entries } = JSON.parse(manifest);
  const { js = [], css = [] } = entries['index'].initial;

  const scriptTags = js
    .map((url) => `<script src="${url}" defer></script>`)
    .join('\n');
  const styleTags = css
    .map((file) => `<link rel="stylesheet" href="${file}">`)
    .join('\n');

  const safeJson = JSON.stringify(data ?? {}).replace(/</g, '\\u003c');

  const html = templateHtml.replace('<!--app-content-->', markup).replace(
    '<!--app-head-->',
    `
      <script id="server-data" type="application/json">${safeJson}</script>
      ${scriptTags}
      ${styleTags}
      `
  );

  res.writeHead(200, {
    'Content-Type': 'text/html',
  });
  res.end(html);
};

export async function startDevServer() {
  const { content } = await loadConfig({});
  const rsbuild = await createRsbuild({ rsbuildConfig: content });

  rsbuild.onDevCompileDone(async () => {
    manifest = await fs.promises.readFile('./dist/manifest.json', 'utf-8');
  });

  const app = express();

  // Middleware to parse JSON and form-encoded POST bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const rsbuildServer = await rsbuild.createDevServer();
  const serverRenderMiddleware = serverRender(rsbuildServer);

  // GET /
  app.get('/', async (req, res, next) => {
    try {
      await serverRenderMiddleware(req, res);
    } catch (err) {
      logger.error('SSR render error (GET), downgrade to CSR...\n', err);
      next();
    }
  });

  // POST /
  app.post('/', async (req, res, next) => {
    try {
      await serverRenderMiddleware(req, res);
    } catch (err) {
      logger.error('SSR render error (POST), downgrade to CSR...\n', err);
      next();
    }
  });

  // Rsbuild dev middlewares
  app.use(rsbuildServer.middlewares);

  const httpServer = app.listen(rsbuildServer.port, () => {
    rsbuildServer.afterListen();
    console.log(`Server started at http://localhost:${rsbuildServer.port}`);
  });

  rsbuildServer.connectWebSocket({ server: httpServer });

  return {
    close: async () => {
      await rsbuildServer.close();
      httpServer.close();
    },
  };
}

startDevServer();
