import pokedex from './data/pokedex.json';
import { DETAIL_SHARD_SIZE } from './constants.js';

// Data snapshots come from PokéAPI via scripts/build-data.mjs (`npm run data`).

// Every Pokémon's { id, name, types } in National Dex order. Bundled, so the
// grid, search and type filter work without any network requests.
export const POKEDEX = pokedex;

const byId = new Map(pokedex.map((pokemon) => [pokemon.id, pokemon]));

export const getPokemon = (id) => byId.get(id);

// Stats, abilities, Pokédex entry and evolution chain are fetched on demand
// from public/data/details/<n>.json, each holding DETAIL_SHARD_SIZE
// consecutive dex numbers. Concurrent requests share one fetch and results
// are cached for the session; a failed request is evicted so a retry refetches.
const shards = new Map();

function loadShard(index) {
  if (!shards.has(index)) {
    const promise = fetch(`${import.meta.env.BASE_URL}data/details/${index}.json`).then((res) => {
      if (!res.ok) throw new Error(`Request failed (${res.status}): details shard ${index}`);
      return res.json();
    });
    promise.catch(() => shards.delete(index));
    shards.set(index, promise);
  }
  return shards.get(index);
}

const shardOf = (id) => Math.floor((id - 1) / DETAIL_SHARD_SIZE);

export async function fetchDetails(id) {
  const details = (await loadShard(shardOf(id)))[id];
  if (!details) throw new Error(`No details for #${id}`);
  return details;
}

// Warms the cache (e.g. on hover) so the detail view usually opens fully loaded.
export function prefetchDetails(id) {
  loadShard(shardOf(id)).catch(() => {});
}
