const express = require('express');
const path = require('path');
const fs = require('fs');
const favicon = require('serve-favicon');

const templateHtml = fs.readFileSync('./template.html', 'utf-8');
const routes = ['/'];

function startProdServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

  const serverRender = async (req, res) => {
    const url = req.originalUrl || '/';
    const data = req.method === 'POST' ? req.body : {};
    const remotesPath = path.join(process.cwd(), './dist/server/index.js');
    delete require.cache[require.resolve(remotesPath)];
    const importedApp = require(remotesPath);
    const renderApp = importedApp.renderAppToString;
    const markup = renderApp(url, data);
    const manifest = JSON.parse(
      fs.readFileSync('./dist/manifest.json', 'utf-8')
    );
    const { entries } = manifest;
    const { js = [], css = [] } = entries['index'].initial || {};
    const scriptTags = js
      .map((file) => `<script src="${file}" defer></script>`)
      .join('\n');
    const styleTags = css
      .map((file) => `<link rel="stylesheet" href="${file}">`)
      .join('\n');
    const html = templateHtml
      .replace('<!--app-content-->', markup)
      .replace('<!--app-head-->', `${scriptTags}\n${styleTags}`);
    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  };

  routes.forEach((route) => {
    app.get(route, async (req, res, next) => {
      try {
        await serverRender(req, res);
      } catch (err) {
        console.error(
          `SSR render error (GET ${route}), downgrade to CSR...\n`,
          err
        );
        next();
      }
    });

    app.post(route, async (req, res, next) => {
      try {
        await serverRender(req, res);
      } catch (err) {
        console.error(
          `SSR render error (POST ${route}), downgrade to CSR...\n`,
          err
        );
        next();
      }
    });
  });

  app.post('/api/aboutData', async (req, res) => {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/users'
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('API proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

  app.use(express.static(path.join(process.cwd(), 'dist')));

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`✅ Production server started at http://localhost:${port}`);
  });
}

startProdServer();
