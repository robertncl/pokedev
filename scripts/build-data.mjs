#!/usr/bin/env node
// Snapshots everything the site needs from PokéAPI into static files, so the
// browser never has to call the API or download full-size artwork for the grid:
//
//   src/data/pokedex.json           id, name and types of every Pokémon (bundled)
//   public/data/details/<n>.json    stats, abilities, Pokédex entry and evolution
//                                   chain, sharded by National Dex number
//   public/art/<id>.avif            256px artwork thumbnails
//
// API data is cached in node_modules/.cache/pokedev-data, and thumbnails that
// already exist are kept, so re-runs only fetch what's missing.
//
// Usage: npm run data [-- --refresh] [-- --force-art]
//   --refresh     re-download API data instead of using the cache
//   --force-art   re-encode every thumbnail

import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { DETAIL_SHARD_SIZE, MAX_POKEMON } from '../src/constants.js';

const API = 'https://pokeapi.co/api/v2';
const ARTWORK = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
const THUMB_SIZE = 256;
const CONCURRENCY = 8;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheFile = path.join(root, 'node_modules/.cache/pokedev-data/snapshot.json');
const indexFile = path.join(root, 'src/data/pokedex.json');
const detailsDir = path.join(root, 'public/data/details');
const artDir = path.join(root, 'public/art');

const args = new Set(process.argv.slice(2));

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

// Runs fn over items with at most `limit` in flight, preserving order.
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function request(url, attempts = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      throw new Error(`${res.status} ${res.statusText}: ${url}`);
    } catch (err) {
      if (attempt >= attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
}

const getJSON = async (url) => (await request(url)).json();

const english = (entries) => entries.filter((entry) => entry.language.name === 'en');
const idFromUrl = (url) => Number(url.replace(/\/+$/, '').split('/').pop());

// Breadth-first: [[base], [stage 2...], [stage 3...]]. Branched evolutions
// (e.g. Eevee) become several ids within one stage. Species past MAX_POKEMON
// are left out, since the site has no data for them.
function chainLevels(root) {
  const levels = [];
  for (let frontier = [root]; frontier.length > 0; frontier = frontier.flatMap((node) => node.evolves_to)) {
    const ids = frontier.map((node) => idFromUrl(node.species.url)).filter((id) => id <= MAX_POKEMON);
    if (ids.length > 0) levels.push(ids);
  }
  return levels;
}

async function fetchSnapshot() {
  const ids = Array.from({ length: MAX_POKEMON }, (_, i) => i + 1);
  const chains = new Map();
  let done = 0;

  const pokemon = await mapLimit(ids, CONCURRENCY, async (id) => {
    const [mon, species] = await Promise.all([
      getJSON(`${API}/pokemon/${id}`),
      getJSON(`${API}/pokemon-species/${id}`),
    ]);
    const chainUrl = species.evolution_chain?.url;
    if (chainUrl && !chains.has(chainUrl)) chains.set(chainUrl, getJSON(chainUrl).then((c) => chainLevels(c.chain)));
    const evolution = chainUrl ? await chains.get(chainUrl) : null;

    if (++done % 100 === 0) console.log(`  fetched ${done}/${ids.length}`);
    return {
      id: mon.id,
      name: mon.name,
      types: [...mon.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
      height: mon.height,
      weight: mon.weight,
      baseExp: mon.base_experience,
      stats: mon.stats.map((s) => s.base_stat),
      abilities: [...mon.abilities]
        .sort((a, b) => a.slot - b.slot)
        .map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
      genus: english(species.genera)[0]?.genus ?? null,
      // The most recent English entry, with the API's hard line breaks collapsed.
      flavor: english(species.flavor_text_entries).at(-1)?.flavor_text.replace(/\s+/g, ' ').trim() ?? null,
      evolution,
      artwork: mon.sprites.other?.['official-artwork']?.front_default ?? `${ARTWORK}/${id}.png`,
    };
  });

  const statNames = (await getJSON(`${API}/pokemon/1`)).stats.map((s) => s.stat.name);
  return { statNames, pokemon };
}

async function loadSnapshot() {
  if (!args.has('--refresh') && (await exists(cacheFile))) {
    console.log(`Using cached API data (${path.relative(root, cacheFile)}); pass --refresh to re-download.`);
    return JSON.parse(await readFile(cacheFile, 'utf8'));
  }
  console.log(`Fetching ${MAX_POKEMON} Pokémon from PokéAPI…`);
  const snapshot = await fetchSnapshot();
  await mkdir(path.dirname(cacheFile), { recursive: true });
  await writeFile(cacheFile, JSON.stringify(snapshot));
  return snapshot;
}

async function writeData({ statNames, pokemon }) {
  const expected = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  if (statNames.join() !== expected.join()) throw new Error(`Unexpected stat order: ${statNames.join(', ')}`);

  await mkdir(path.dirname(indexFile), { recursive: true });
  await writeFile(indexFile, JSON.stringify(pokemon.map(({ id, name, types }) => ({ id, name, types }))) + '\n');

  await rm(detailsDir, { recursive: true, force: true });
  await mkdir(detailsDir, { recursive: true });
  const shards = new Map();
  for (const { id, height, weight, baseExp, stats, abilities, genus, flavor, evolution } of pokemon) {
    const shard = Math.floor((id - 1) / DETAIL_SHARD_SIZE);
    if (!shards.has(shard)) shards.set(shard, {});
    shards.get(shard)[id] = { height, weight, baseExp, stats, abilities, genus, flavor, evolution };
  }
  for (const [shard, records] of shards) {
    await writeFile(path.join(detailsDir, `${shard}.json`), JSON.stringify(records));
  }
  console.log(`Wrote ${path.relative(root, indexFile)} and ${shards.size} detail shards.`);
}

async function writeThumbnails({ pokemon }) {
  await mkdir(artDir, { recursive: true });
  const force = args.has('--force-art');
  let encoded = 0;
  await mapLimit(pokemon, CONCURRENCY, async ({ id, artwork }) => {
    const out = path.join(artDir, `${id}.avif`);
    if (!force && (await exists(out))) return;
    const png = Buffer.from(await (await request(artwork)).arrayBuffer());
    await sharp(png)
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .avif({ quality: 50, effort: 6 })
      .toFile(out);
    if (++encoded % 100 === 0) console.log(`  encoded ${encoded} thumbnails`);
  });
  console.log(`Encoded ${encoded} new thumbnails into ${path.relative(root, artDir)}.`);
}

const snapshot = await loadSnapshot();
await writeData(snapshot);
await writeThumbnails(snapshot);
