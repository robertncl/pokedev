import { MAX_POKEMON } from './constants.js';

const API = 'https://pokeapi.co/api/v2';

// Dedupes concurrent requests and caches results for the session.
// Failed requests are evicted so a retry actually refetches.
const cache = new Map();

function getJSON(url) {
  if (!cache.has(url)) {
    const promise = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
      return res.json();
    });
    promise.catch(() => cache.delete(url));
    cache.set(url, promise);
  }
  return cache.get(url);
}

export const idFromUrl = (url) => Number(url.replace(/\/+$/, '').split('/').pop());

export async function fetchIndex() {
  const data = await getJSON(`${API}/pokemon?limit=${MAX_POKEMON}`);
  return data.results.map((entry) => ({ name: entry.name, id: idFromUrl(entry.url) }));
}

export const fetchPokemon = (idOrName) => getJSON(`${API}/pokemon/${idOrName}`);

export async function fetchTypeMembers(type) {
  const data = await getJSON(`${API}/type/${type}`);
  return new Set(
    data.pokemon.map((entry) => idFromUrl(entry.pokemon.url)).filter((id) => id <= MAX_POKEMON)
  );
}

export const fetchSpecies = (url) => getJSON(url);

export const fetchEvolutionChain = (url) => getJSON(url);
