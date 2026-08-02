import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The module keeps an in-memory cache keyed by URL, so each test gets a
// fresh module instance to avoid cross-test cache pollution.
async function freshApi() {
  vi.resetModules();
  return import('./api.js');
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

describe('idFromUrl', () => {
  it('extracts the trailing numeric id from a resource URL', async () => {
    const { idFromUrl } = await freshApi();
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
  });

  it('handles URLs without a trailing slash', async () => {
    const { idFromUrl } = await freshApi();
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon-species/1')).toBe(1);
  });
});

describe('fetchIndex', () => {
  it('maps the index results to {name, id} pairs', async () => {
    const { fetchIndex } = await freshApi();
    fetch.mockResolvedValue(
      jsonResponse({
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      })
    );
    const result = await fetchIndex();
    expect(result).toEqual([
      { name: 'bulbasaur', id: 1 },
      { name: 'ivysaur', id: 2 },
    ]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/pokemon?limit='));
  });
});

describe('fetchPokemon', () => {
  it('fetches and returns pokemon JSON by id or name', async () => {
    const { fetchPokemon } = await freshApi();
    fetch.mockResolvedValue(jsonResponse({ id: 25, name: 'pikachu' }));
    const result = await fetchPokemon('pikachu');
    expect(result).toEqual({ id: 25, name: 'pikachu' });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/pokemon/pikachu'));
  });

  it('dedupes concurrent requests for the same URL', async () => {
    const { fetchPokemon } = await freshApi();
    fetch.mockResolvedValue(jsonResponse({ id: 25, name: 'pikachu' }));
    await Promise.all([fetchPokemon('pikachu'), fetchPokemon('pikachu')]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('evicts a failed request from the cache so a retry refetches', async () => {
    const { fetchPokemon } = await freshApi();
    fetch.mockResolvedValueOnce(jsonResponse(null, false, 404));
    await expect(fetchPokemon('missingno')).rejects.toThrow('Request failed (404)');

    fetch.mockResolvedValueOnce(jsonResponse({ id: 1, name: 'missingno' }));
    const result = await fetchPokemon('missingno');
    expect(result).toEqual({ id: 1, name: 'missingno' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('fetchTypeMembers', () => {
  it('returns a Set of member ids capped at MAX_POKEMON', async () => {
    const { fetchTypeMembers } = await freshApi();
    fetch.mockResolvedValue(
      jsonResponse({
        pokemon: [
          { pokemon: { url: 'https://pokeapi.co/api/v2/pokemon/4/' } },
          { pokemon: { url: 'https://pokeapi.co/api/v2/pokemon/9999/' } },
        ],
      })
    );
    const result = await fetchTypeMembers('fire');
    expect(result).toEqual(new Set([4]));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/type/fire'));
  });
});

describe('fetchSpecies', () => {
  it('fetches JSON from the given species URL', async () => {
    const { fetchSpecies } = await freshApi();
    fetch.mockResolvedValue(jsonResponse({ flavor_text_entries: [] }));
    const result = await fetchSpecies('https://pokeapi.co/api/v2/pokemon-species/25/');
    expect(result).toEqual({ flavor_text_entries: [] });
    expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon-species/25/');
  });
});

describe('fetchEvolutionChain', () => {
  it('fetches JSON from the given evolution chain URL', async () => {
    const { fetchEvolutionChain } = await freshApi();
    fetch.mockResolvedValue(jsonResponse({ chain: {} }));
    const result = await fetchEvolutionChain('https://pokeapi.co/api/v2/evolution-chain/10/');
    expect(result).toEqual({ chain: {} });
    expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/evolution-chain/10/');
  });
});
