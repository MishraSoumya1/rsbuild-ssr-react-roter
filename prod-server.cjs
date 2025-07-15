const express = require('express');
const fs = require('fs');
const path = require('path');

const templateHtml = fs.readFileSync('./template.html', 'utf-8');

// Render function with optional POST data support
const serverRender = (req, res) => {
  const remotesPath = path.join(process.cwd(), './dist/server/index.js');
  const importedApp = require(remotesPath);

  const url = req.originalUrl || '/';
  const data = req.method === 'POST' ? req.body : {};

  const markup = importedApp.renderAppToString(url, data);

  const { entries } = JSON.parse(
    fs.readFileSync('./dist/manifest.json', 'utf-8')
  );

  const { js = [], css = [] } = entries['index'].initial;

  const scriptTags = js
    .map((file) => `<script src="${file}" defer></script>`)
    .join('\n');
  const styleTags = css
    .map((file) => `<link rel="stylesheet" href="${file}">`)
    .join('\n');

  // Safe and escaped serverData injection
  const safeJson = JSON.stringify(data ?? {}).replace(/</g, '\\u003c');

  const html = templateHtml.replace('<!--app-content-->', markup).replace(
    '<!--app-head-->',
    `
      <script id="server-data" type="application/json">${safeJson}</script>
      ${scriptTags}
      ${styleTags}
      `
  );

  res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
};

const port = process.env.PORT || 3000;

async function preview() {
  const app = express();

  // Middleware to handle JSON and form submissions
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Handle SSR on both GET and POST /
  app.get('/', (req, res, next) => {
    try {
      serverRender(req, res);
    } catch (err) {
      console.error('SSR render error (GET), downgrade to CSR...\n', err);
      next();
    }
  });

  app.post('/', (req, res, next) => {
    try {
      serverRender(req, res);
    } catch (err) {
      console.error('SSR render error (POST), downgrade to CSR...\n', err);
      next();
    }
  });

  // Serve static assets (JS, CSS, etc.)
  app.use(express.static('dist'));

  app.listen(port, () => {
    console.log(`✅ Production server started at http://localhost:${port}`);
  });
}

preview();
