import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { StaticRouter } from 'react-router-dom/server';

export function renderAppToString(url = '/', data: any = {}) {
  console.log('#### App rendered with serverData:', data);
  return renderToString(
    <React.StrictMode>
      <App Router={(props) => <StaticRouter location={url} {...props} />} serverData={data} />
    </React.StrictMode>
  );
}
