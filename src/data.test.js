import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DETAIL_SHARD_SIZE, MAX_POKEMON, TYPES } from './constants.js';

// The module caches shards for the session, so each test gets a fresh module
// instance to avoid cross-test cache pollution.
async function freshData() {
  vi.resetModules();
  return import('./data.js');
}

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(body) };
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POKEDEX', () => {
  it('lists every Pokémon in dex order with a name and one or two known types', async () => {
    const { POKEDEX } = await freshData();
    expect(POKEDEX).toHaveLength(MAX_POKEMON);
    POKEDEX.forEach((pokemon, i) => {
      expect(pokemon.id).toBe(i + 1);
      expect(pokemon.name).toMatch(/^[a-z0-9-]+$/);
      expect(pokemon.types.length).toBeGreaterThanOrEqual(1);
      expect(pokemon.types.length).toBeLessThanOrEqual(2);
      pokemon.types.forEach((type) => expect(TYPES).toContain(type));
    });
  });
});

describe('getPokemon', () => {
  it('looks a Pokémon up by dex number', async () => {
    const { getPokemon } = await freshData();
    expect(getPokemon(25)).toEqual({ id: 25, name: 'pikachu', types: ['electric'] });
    expect(getPokemon(9999)).toBeUndefined();
  });
});

describe('fetchDetails', () => {
  const pikachu = { height: 4, weight: 60, stats: [35, 55, 40, 50, 50, 90] };

  it("fetches the shard that holds the id and returns that Pokémon's record", async () => {
    const { fetchDetails } = await freshData();
    fetch.mockResolvedValue(jsonResponse({ 25: pikachu }));
    await expect(fetchDetails(25)).resolves.toEqual(pikachu);
    expect(fetch).toHaveBeenCalledWith('/data/details/en/0.json');
  });

  it('maps ids to shards of DETAIL_SHARD_SIZE consecutive dex numbers', async () => {
    const { fetchDetails } = await freshData();
    const lastOfFirst = DETAIL_SHARD_SIZE;
    const firstOfSecond = DETAIL_SHARD_SIZE + 1;
    fetch.mockImplementation((url) =>
      Promise.resolve(jsonResponse(url.endsWith('/0.json') ? { [lastOfFirst]: {} } : { [firstOfSecond]: {} }))
    );
    await fetchDetails(lastOfFirst);
    await fetchDetails(firstOfSecond);
    expect(fetch.mock.calls.map(([url]) => url)).toEqual(['/data/details/en/0.json', '/data/details/en/1.json']);
  });

  it('fetches and caches each language separately', async () => {
    const { fetchDetails } = await freshData();
    fetch.mockResolvedValue(jsonResponse({ 25: pikachu }));
    await fetchDetails(25, 'ja');
    await fetchDetails(25, 'ja');
    await fetchDetails(25);
    expect(fetch.mock.calls.map(([url]) => url)).toEqual(['/data/details/ja/0.json', '/data/details/en/0.json']);
  });

  it('shares one request between Pokémon in the same shard', async () => {
    const { fetchDetails, prefetchDetails } = await freshData();
    fetch.mockResolvedValue(jsonResponse({ 1: {}, 2: {}, 3: {} }));
    prefetchDetails(1);
    await Promise.all([fetchDetails(2), fetchDetails(3)]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('evicts a failed request so a retry refetches', async () => {
    const { fetchDetails } = await freshData();
    fetch.mockResolvedValueOnce(jsonResponse(null, false, 503));
    await expect(fetchDetails(25)).rejects.toThrow('Request failed (503)');

    fetch.mockResolvedValueOnce(jsonResponse({ 25: pikachu }));
    await expect(fetchDetails(25)).resolves.toEqual(pikachu);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('rejects when the shard has no record for the id', async () => {
    const { fetchDetails } = await freshData();
    fetch.mockResolvedValue(jsonResponse({}));
    await expect(fetchDetails(7)).rejects.toThrow('No details for #7');
  });

  it('prefetchDetails swallows failures', async () => {
    const { prefetchDetails } = await freshData();
    fetch.mockRejectedValue(new Error('offline'));
    expect(() => prefetchDetails(1)).not.toThrow();
    await Promise.resolve();
  });
});
