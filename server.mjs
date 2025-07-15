import express from 'express';
import fs from 'fs';
import { createRsbuild, loadConfig, logger } from '@rsbuild/core';
import path from 'path';
import favicon from 'serve-favicon';

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
    .map((src) => `<script src="${src}" defer></script>`)
    .join('\n');
  const styleTags = css
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join('\n');

  const html = templateHtml
    .replace('<!--app-content-->', markup)
    .replace('<!--app-head-->', `${scriptTags}\n${styleTags}`);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
};

export async function startDevServer() {
  const { content } = await loadConfig({});
  const rsbuild = await createRsbuild({ rsbuildConfig: content });

  rsbuild.onDevCompileDone(async () => {
    manifest = await fs.promises.readFile('./dist/manifest.json', 'utf-8');
  });

  const app = express();

  app.use(express.static('public'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(favicon(path.join(process.cwd(), 'public', 'favicon.ico')));

  const rsbuildServer = await rsbuild.createDevServer();
  const serverRenderMiddleware = serverRender(rsbuildServer);

  // Define routes config array here
  const routes = ['/', '/about']; // Add your routes here

  routes.forEach((route) => {
    app.get(route, async (req, res, next) => {
      try {
        await serverRenderMiddleware(req, res);
      } catch (err) {
        logger.error(
          `SSR render error (GET ${route}), downgrade to CSR...\n`,
          err
        );
        next();
      }
    });

    app.post(route, async (req, res, next) => {
      try {
        await serverRenderMiddleware(req, res);
      } catch (err) {
        logger.error(
          `SSR render error (POST ${route}), downgrade to CSR...\n`,
          err
        );
        next();
      }
    });

    // Proxy API route (hides real URL from client)
    app.post('/api/aboutData', async (req, res) => {
      try {
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/users'
        );
        const data = await response.json();
        res.json(data); // send result back to client
      } catch (error) {
        console.error('API proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    });
  });

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
