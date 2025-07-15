import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { StaticRouter } from 'react-router-dom/server';

export function renderAppToString(url = '/', data: any = {}) {
  console.log('#### App rendered with serverData:', data);

  const appHtml = renderToString(
    <React.StrictMode>
      <App Router={(props) => <StaticRouter location={url} {...props} />} serverData={data} />
    </React.StrictMode>
  );

  // Embed the serverData JSON in a hidden div after the app root
  const safeJson = JSON.stringify(data).replace(/</g, '\\u003c');

  return `${appHtml}<div id="server-data" style="display:none;">${safeJson}</div>`;
}
