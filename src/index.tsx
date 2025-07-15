import { hydrateRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './App.css';

const el = document.getElementById('server-data');
const serverData = el ? JSON.parse(el.textContent || '{}') : {};

hydrateRoot(
  document.getElementById('root')!,
  <App Router={BrowserRouter} serverData={serverData} />
);
