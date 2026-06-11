const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function HeartIcon({ filled = false }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...strokeProps}
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function SparklesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10 3l1.7 4.6L16.3 9.3l-4.6 1.7L10 15.6 8.3 11 3.7 9.3 8.3 7.6 10 3z" />
      <path d="M18 13l1.1 2.9L22 17l-2.9 1.1L18 21l-1.1-2.9L14 17l2.9-1.1L18 13z" />
    </svg>
  );
}
