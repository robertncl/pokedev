/// <reference types="vitest/config" />
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Builds the client, then a server bundle of src/entry-server.jsx, and uses it
// to render the initial view (header, filters, first page of the grid) into
// dist/index.html. The small stylesheet is inlined too, so the page paints,
// artwork included, before any JavaScript arrives; main.jsx hydrates it.
async function buildAndPrerender(builder) {
  const { client, ssr } = builder.environments;
  await builder.build(client);
  await builder.build(ssr);

  const { root, base } = builder.config;
  const outDir = path.resolve(root, client.config.build.outDir);
  const ssrDir = path.resolve(root, ssr.config.build.outDir);
  const htmlFile = path.join(outDir, 'index.html');
  const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

  let html = await readFile(htmlFile, 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error('prerender: #root not found in index.html');
  html = html.replace('<div id="root"></div>', () => `<div id="root">${render()}</div>`);

  const stylesheet = html.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/);
  if (stylesheet) {
    const cssFile = path.join(outDir, stylesheet[1].slice(base.length));
    const css = await readFile(cssFile, 'utf8');
    html = html.replace(stylesheet[0], () => `<style>${css}</style>`);
    await rm(cssFile);
  }

  await writeFile(htmlFile, html);
  await rm(ssrDir, { recursive: true, force: true });
}

export default defineConfig({
  plugins: [react()],
  builder: {
    buildApp: buildAndPrerender,
  },
  environments: {
    ssr: {
      build: {
        outDir: 'node_modules/.cache/pokedev-ssr',
        emptyOutDir: true,
        rollupOptions: { input: 'src/entry-server.jsx' },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/entry-server.jsx', 'src/test/**'],
    },
  },
});
