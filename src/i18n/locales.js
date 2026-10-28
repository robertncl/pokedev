// Supported languages, by number of speakers worldwide plus the languages the
// Pokémon games ship in. `code` is the BCP 47 tag used for <html lang>, Intl
// and file names. `pokeapi` lists the PokéAPI language codes to take Pokémon
// names, abilities and Pokédex entries from, in order of preference; locales
// without it have no official Pokémon data and show the English names.
// Shared with scripts/build-data.mjs, so this file must stay plain JS.
export const LOCALES = [
  { code: 'en', name: 'English', pokeapi: ['en'] },
  { code: 'zh-Hans', name: '简体中文', pokeapi: ['zh-hans'] },
  { code: 'zh-Hant', name: '繁體中文', pokeapi: ['zh-hant'] },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'es', name: 'Español', pokeapi: ['es', 'es-419'] },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'fr', name: 'Français', pokeapi: ['fr'] },
  { code: 'bn', name: 'বাংলা' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'ja', name: '日本語', pokeapi: ['ja', 'ja-hrkt'] },
  { code: 'de', name: 'Deutsch', pokeapi: ['de'] },
  { code: 'ko', name: '한국어', pokeapi: ['ko'] },
  { code: 'it', name: 'Italiano', pokeapi: ['it'] },
];

export const DEFAULT_LOCALE = 'en';

// Locales with their own Pokémon data; the rest use English data.
export const DATA_LOCALES = LOCALES.filter((locale) => locale.pokeapi).map((locale) => locale.code);

export const dataLocaleOf = (code) => (DATA_LOCALES.includes(code) ? code : DEFAULT_LOCALE);
