import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MAX_POKEMON, TYPES } from '../constants.js';
import { DATA_LOCALES, dataLocaleOf, DEFAULT_LOCALE, LOCALES } from './locales.js';
import en from './messages/en.js';

const messageFiles = import.meta.glob('./messages/*.js', { eager: true, import: 'default' });
// Vitest runs from the project root.
const projectFile = (file) => path.resolve(file);
const placeholders = (text) => (text.match(/\{\w+\}/g) ?? []).sort();

describe('LOCALES', () => {
  it('has unique codes, with English as the default', () => {
    const codes = LOCALES.map((locale) => locale.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toContain(DEFAULT_LOCALE);
  });

  it('maps locales without Pokémon data onto English data', () => {
    expect(DATA_LOCALES).toEqual(['en', 'zh-Hans', 'zh-Hant', 'es', 'fr', 'ja', 'de', 'ko', 'it']);
    expect(dataLocaleOf('ja')).toBe('ja');
    expect(dataLocaleOf('hi')).toBe('en');
  });
});

describe('messages', () => {
  it('has a name for every type', () => {
    TYPES.forEach((type) => expect(en[`type.${type}`]).toBeTruthy());
  });

  it.each(LOCALES.map((locale) => locale.code))('translates every string for %s', (code) => {
    const messages = messageFiles[`./messages/${code}.js`];
    expect(messages).toBeDefined();
    expect(Object.keys(messages)).toEqual(Object.keys(en));
    for (const [key, text] of Object.entries(messages)) {
      expect(text, key).toBeTruthy();
      expect(placeholders(text), key).toEqual(placeholders(en[key]));
    }
  });
});

describe('Pokémon data', () => {
  it.each(DATA_LOCALES)('has detail shards for %s', (code) => {
    expect(existsSync(projectFile(`public/data/details/${code}/0.json`))).toBe(true);
  });

  it.each(DATA_LOCALES.filter((code) => code !== DEFAULT_LOCALE))('names every Pokémon in %s', (code) => {
    const names = JSON.parse(readFileSync(projectFile(`src/data/locales/${code}.json`), 'utf8'));
    expect(names.pokemon).toHaveLength(MAX_POKEMON);
    names.pokemon.forEach((name) => expect(name).toBeTruthy());
    expect(Object.keys(names.abilities).length).toBeGreaterThan(250);
  });
});
