// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { render } from './entry-server.jsx';

// Runs without a DOM, like the build-time prerender.
describe('entry-server render', () => {
  it('prerenders the header, filters and first page of the grid', () => {
    const html = render();
    expect(html).toContain('Poké<span>Dev</span>');
    expect(html).toContain('aria-label="Filter by type"');
    expect(html).toMatch(/Showing <!-- -->24<!-- --> of <!-- -->1025<!-- --> Pokémon/);
    expect(html.match(/<article/g)).toHaveLength(24);
    expect(html).toContain('src="/art/1.avif"');
  });

  it('renders no favorites, since saved ones only exist in the browser', () => {
    const html = render();
    expect(html).not.toContain('from favorites" aria-pressed="true"');
    expect(html).not.toContain('class="indicator"');
  });
});
