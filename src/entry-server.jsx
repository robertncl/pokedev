import { renderToString } from 'react-dom/server';
import App from './App.jsx';

// Used at build time to prerender the initial view (see vite.config.js).
export const render = () => renderToString(<App />);
