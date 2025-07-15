const express = require('express');
const favicon = require('serve-favicon');
const fs = require('fs');
const path = require('path');

const templateHtml = fs.readFileSync('./template.html', 'utf-8');

// Define your routes here or load from a config file
const routes = ['/', '/about'];

const serverRender = (req, res) => {
  const remotesPath = path.join(process.cwd(), './dist/server/index.js');

  // Clear cache to always get fresh SSR bundle (important for prod deploys)
  delete require.cache[require.resolve(remotesPath)];
  const importedApp = require(remotesPath);

  const url = req.originalUrl || '/';
  const data = req.method === 'POST' ? req.body : {};

  const markup = importedApp.renderAppToString(url, data);

  const manifest = JSON.parse(fs.readFileSync('./dist/manifest.json', 'utf-8'));
  const { entries } = manifest;
  const { js = [], css = [] } = entries['index'].initial || {};

  const scriptTags = js
    .map((file) => `<script src="${file}" defer></script>`)
    .join('\n');
  const styleTags = css
    .map((file) => `<link rel="stylesheet" href="${file}">`)
    .join('\n');

  // Insert rendered app + hidden server-data div inside root placeholder
  // Insert JS/CSS tags inside head placeholder
  const html = templateHtml
    .replace('<!--app-content-->', markup)
    .replace('<!--app-head-->', `${scriptTags}\n${styleTags}`);

  res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
};

const port = process.env.PORT || 3000;

async function startProdServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(favicon(path.join(process.cwd(), 'public', 'favicon.ico')));

  // Register routes dynamically (GET and POST)
  routes.forEach((route) => {
    app.get(route, (req, res, next) => {
      try {
        serverRender(req, res);
      } catch (err) {
        console.error(
          `SSR render error (GET ${route}), downgrade to CSR...\n`,
          err
        );
        next();
      }
    });

    app.post(route, (req, res, next) => {
      try {
        serverRender(req, res);
      } catch (err) {
        console.error(
          `SSR render error (POST ${route}), downgrade to CSR...\n`,
          err
        );
        next();
      }
    });
  });

  // Serve static files (JS, CSS, images, etc.) from dist folder
  app.use(express.static(path.join(process.cwd(), 'dist')));

  app.listen(port, () => {
    console.log(`✅ Production server started at http://localhost:${port}`);
  });
}

startProdServer();
