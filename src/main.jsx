import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { syncColorSchemeAcrossTabs } from './colorScheme.js';
import { initLocale } from './i18n/index.js';
import './index.css';

const container = document.getElementById('root');
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production builds prerender the initial view into index.html (see
// vite.config.js), so hydrate it; the dev server serves an empty root.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);

syncColorSchemeAcrossTabs();
initLocale();
