import pokedex from './data/pokedex.json';
import { DETAIL_SHARD_SIZE } from './constants.js';
import { DEFAULT_LOCALE } from './i18n/locales.js';

// Data snapshots come from PokéAPI via scripts/build-data.mjs (`npm run data`).

// Every Pokémon's { id, name, types } in National Dex order. Bundled, so the
// grid, search and type filter work without any network requests.
export const POKEDEX = pokedex;

const byId = new Map(pokedex.map((pokemon) => [pokemon.id, pokemon]));

export const getPokemon = (id) => byId.get(id);

// Stats, abilities, Pokédex entry and evolution chain are fetched on demand
// from public/data/details/<locale>/<n>.json, each holding DETAIL_SHARD_SIZE
// consecutive dex numbers, with the genus and Pokédex entry in that locale
// (one of DATA_LOCALES). Concurrent requests share one fetch and results are
// cached for the session; a failed request is evicted so a retry refetches.
const shards = new Map();

function loadShard(locale, index) {
  const file = `${locale}/${index}.json`;
  if (!shards.has(file)) {
    const promise = fetch(`${import.meta.env.BASE_URL}data/details/${file}`).then((res) => {
      if (!res.ok) throw new Error(`Request failed (${res.status}): details shard ${file}`);
      return res.json();
    });
    promise.catch(() => shards.delete(file));
    shards.set(file, promise);
  }
  return shards.get(file);
}

const shardOf = (id) => Math.floor((id - 1) / DETAIL_SHARD_SIZE);

export async function fetchDetails(id, locale = DEFAULT_LOCALE) {
  const details = (await loadShard(locale, shardOf(id)))[id];
  if (!details) throw new Error(`No details for #${id}`);
  return details;
}

// Warms the cache (e.g. on hover) so the detail view usually opens fully loaded.
export function prefetchDetails(id, locale = DEFAULT_LOCALE) {
  loadShard(locale, shardOf(id)).catch(() => {});
}
