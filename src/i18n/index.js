import { useSyncExternalStore } from 'react';
import { formatName } from '../constants.js';
import { dataLocaleOf, DEFAULT_LOCALE, LOCALES } from './locales.js';
import en from './messages/en.js';

// The UI language. English is bundled; other languages' strings and Pokémon
// names are separate chunks, loaded when the language is picked. The page is
// prerendered in English, so (like favorites) the chosen language is a small
// external store whose server snapshot is English: the page hydrates as
// rendered, then switches once the language has loaded.

export const LOCALE_KEY = 'pokedev-locale';

const messageFiles = import.meta.glob(['./messages/*.js', '!./messages/en.js'], { import: 'default' });
const nameFiles = import.meta.glob('../data/locales/*.json', { import: 'default' });

const localeOf = (code) => LOCALES.find((locale) => locale.code === code);

const interpolate = (template, vars) =>
  template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));

// `names` (from src/data/locales/) is null for languages without official
// Pokémon data: those show the English names.
function createI18n(locale, messages, names) {
  const message = (key) => messages[key] ?? en[key];
  const t = (key, vars) => {
    const template = message(key) ?? key;
    return vars ? interpolate(template, vars) : template;
  };
  const number = new Intl.NumberFormat(locale.code);
  const units = {};
  const unit = (name) =>
    (units[name] ??= new Intl.NumberFormat(locale.code, {
      style: 'unit',
      unit: name,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }));

  return {
    locale: locale.code,
    dir: locale.dir ?? 'ltr',
    // Which detail files to read (see dataLocaleOf).
    dataLocale: dataLocaleOf(locale.code),
    t,
    pokemonName: (pokemon) => names?.pokemon[pokemon.id - 1] ?? formatName(pokemon.name),
    abilityName: (slug) => names?.abilities[slug] ?? formatName(slug),
    typeName: (type) => message(`type.${type}`) ?? formatName(type),
    formatNumber: (value) => number.format(value),
    // e.g. formatUnit(0.7, 'meter') → "0.7 m"
    formatUnit: (value, name) => unit(name).format(value),
  };
}

const ENGLISH = createI18n(localeOf(DEFAULT_LOCALE), en, null);

// Concurrent requests for a language share one load; a failed load is
// evicted so picking the language again retries.
const loaded = new Map([[DEFAULT_LOCALE, Promise.resolve(ENGLISH)]]);

function load(locale) {
  if (!loaded.has(locale.code)) {
    const dataLocale = dataLocaleOf(locale.code);
    const promise = Promise.all([
      messageFiles[`./messages/${locale.code}.js`](),
      dataLocale === DEFAULT_LOCALE ? null : nameFiles[`../data/locales/${dataLocale}.json`](),
    ]).then(([messages, names]) => createI18n(locale, messages, names));
    promise.catch(() => loaded.delete(locale.code));
    loaded.set(locale.code, promise);
  }
  return loaded.get(locale.code);
}

let current = ENGLISH;
let requested = DEFAULT_LOCALE;
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function applyToDocument(i18n) {
  const root = document.documentElement;
  root.lang = i18n.locale;
  root.dir = i18n.dir;
  document.title = i18n.t('meta.title');
}

// The best supported language for a list of BCP 47 tags (e.g.
// navigator.languages): "pt-BR" → "pt", "zh-TW" → "zh-Hant".
export function matchLocale(tags) {
  for (const tag of tags) {
    let language, script;
    try {
      ({ language, script } = new Intl.Locale(tag).maximize());
    } catch {
      continue;
    }
    const code = language === 'zh' ? `zh-${script}` : language;
    if (localeOf(code)) return code;
  }
  return DEFAULT_LOCALE;
}

function storedLocale() {
  try {
    return localeOf(localStorage.getItem(LOCALE_KEY))?.code ?? null;
  } catch {
    return null;
  }
}

const preferredLocale = () => storedLocale() ?? matchLocale(navigator.languages ?? [navigator.language]);

// Switches the UI language. `remember` saves an explicit choice; otherwise
// the language follows the browser's.
export async function setLocale(code, { remember = true } = {}) {
  const locale = localeOf(code) ?? localeOf(DEFAULT_LOCALE);
  requested = locale.code;
  if (remember) {
    try {
      localStorage.setItem(LOCALE_KEY, locale.code);
    } catch {
      /* storage unavailable — the choice lasts until reload */
    }
  }
  let next;
  try {
    next = await load(locale);
  } catch {
    return; // offline or a stale deploy: stay in the current language
  }
  // A later choice may have loaded first.
  if (requested !== locale.code || current === next) return;
  current = next;
  applyToDocument(next);
  for (const listener of listeners) listener();
}

// Picks the stored or browser language and follows changes made in other
// tabs (`key` is null when storage was cleared).
export function initLocale() {
  setLocale(preferredLocale(), { remember: false });
  const handleStorage = (e) => {
    if (e.key === LOCALE_KEY || e.key === null) setLocale(preferredLocale(), { remember: false });
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

export function useI18n() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => ENGLISH
  );
}
