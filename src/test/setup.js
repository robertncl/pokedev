import '@testing-library/jest-dom/vitest';

// DOM shims, skipped by tests that run in the node environment.
if (typeof window !== 'undefined') {
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

  // jsdom reflects <dialog open> but has no showModal()/close().
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function close() {
      if (!this.open) return;
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  }

  // index.html's color-scheme meta, which the theme toggle drives.
  const meta = document.createElement('meta');
  meta.name = 'color-scheme';
  meta.content = 'light dark';
  document.head.append(meta);
}
