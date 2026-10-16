// Light/dark theme. The page follows the system preference; the toggle stores
// an override only when it differs from the system, and applies it through
// <meta name="color-scheme"> (which index.css maps onto `color-scheme`). An
// inline script in index.html applies a stored override before first paint.

export const COLOR_SCHEME_KEY = 'pokedev-color-scheme';
// Where the Mantine-based version kept the choice; still honored by index.html.
const LEGACY_KEY = 'mantine-color-scheme-value';

const meta = () => document.querySelector('meta[name="color-scheme"]');
const systemScheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const isScheme = (value) => value === 'light' || value === 'dark';

function apply(override) {
  meta().content = isScheme(override) ? override : 'light dark';
}

// Switches to the opposite of what's on screen. Switching back to the system
// scheme clears the override instead of pinning it.
export function toggleColorScheme() {
  const shown = meta().content;
  const current = isScheme(shown) ? shown : systemScheme();
  const target = current === 'dark' ? 'light' : 'dark';
  const override = target === systemScheme() ? null : target;
  try {
    if (override) localStorage.setItem(COLOR_SCHEME_KEY, override);
    else localStorage.removeItem(COLOR_SCHEME_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* storage unavailable — the choice lasts until reload */
  }
  apply(override);
}

// Follows changes made in other tabs. `key` is null when storage was cleared.
export function syncColorSchemeAcrossTabs() {
  const handleStorage = (e) => {
    if (e.key === COLOR_SCHEME_KEY || e.key === null) apply(e.newValue);
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}
