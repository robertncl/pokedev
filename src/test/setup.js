import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia; default to "no match" so hooks/components
// that call it don't crash. Individual tests can still stub it per-case.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}

// jsdom does not implement ResizeObserver, which Mantine's ScrollArea uses.
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
