import {
  artworkUrl,
  formatName,
  NAME_OVERRIDES,
  padId,
  shinyArtworkUrl,
  STAT_LABELS,
  TYPE_COLORS,
  TYPES,
} from './constants.js';

describe('artworkUrl', () => {
  it('builds the official-artwork URL for an id', () => {
    expect(artworkUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    );
  });
});

describe('shinyArtworkUrl', () => {
  it('builds the shiny official-artwork URL for an id', () => {
    expect(shinyArtworkUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/25.png'
    );
  });
});

describe('padId', () => {
  it('pads small ids to 4 digits with a leading #', () => {
    expect(padId(1)).toBe('#0001');
  });

  it('does not truncate ids already 4+ digits', () => {
    expect(padId(1025)).toBe('#1025');
  });
});

describe('formatName', () => {
  it('returns the override when one exists', () => {
    expect(formatName('nidoran-f')).toBe(NAME_OVERRIDES['nidoran-f']);
  });

  it('title-cases and joins hyphenated names with spaces when no override exists', () => {
    expect(formatName('great-tusk')).toBe('Great Tusk');
  });

  it('title-cases a single-word name', () => {
    expect(formatName('pikachu')).toBe('Pikachu');
  });

  it('preserves empty segments produced by consecutive hyphens', () => {
    expect(formatName('a--b')).toBe('A  B');
  });
});

describe('constant tables', () => {
  it('derives TYPES from the keys of TYPE_COLORS', () => {
    expect(TYPES).toEqual(Object.keys(TYPE_COLORS));
  });

  it('exposes a label for every stat', () => {
    expect(STAT_LABELS.hp).toBe('HP');
    expect(STAT_LABELS.speed).toBe('Speed');
  });
});
