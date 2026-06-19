export const MAX_POKEMON = 1025;
export const PAGE_SIZE = 24;

export const TYPE_COLORS = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export const TYPES = Object.keys(TYPE_COLORS);

export const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

// Display names for Pokémon whose API name is a default-form slug or
// loses punctuation (the API only exposes lowercase hyphenated names).
export const NAME_OVERRIDES = {
  'nidoran-f': 'Nidoran ♀',
  'nidoran-m': 'Nidoran ♂',
  farfetchd: "Farfetch'd",
  'mr-mime': 'Mr. Mime',
  'ho-oh': 'Ho-Oh',
  'deoxys-normal': 'Deoxys',
  'wormadam-plant': 'Wormadam',
  'mime-jr': 'Mime Jr.',
  'porygon-z': 'Porygon-Z',
  'giratina-altered': 'Giratina',
  'shaymin-land': 'Shaymin',
  'basculin-red-striped': 'Basculin',
  'darmanitan-standard': 'Darmanitan',
  'tornadus-incarnate': 'Tornadus',
  'thundurus-incarnate': 'Thundurus',
  'landorus-incarnate': 'Landorus',
  'keldeo-ordinary': 'Keldeo',
  'meloetta-aria': 'Meloetta',
  flabebe: 'Flabébé',
  'meowstic-male': 'Meowstic',
  'aegislash-shield': 'Aegislash',
  'pumpkaboo-average': 'Pumpkaboo',
  'gourgeist-average': 'Gourgeist',
  'zygarde-50': 'Zygarde',
  'oricorio-baile': 'Oricorio',
  'lycanroc-midday': 'Lycanroc',
  'wishiwashi-solo': 'Wishiwashi',
  'type-null': 'Type: Null',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  'tapu-koko': 'Tapu Koko',
  'tapu-lele': 'Tapu Lele',
  'tapu-bulu': 'Tapu Bulu',
  'tapu-fini': 'Tapu Fini',
  'minior-red-meteor': 'Minior',
  'mimikyu-disguised': 'Mimikyu',
  'toxtricity-amped': 'Toxtricity',
  sirfetchd: "Sirfetch'd",
  'mr-rime': 'Mr. Rime',
  'eiscue-ice': 'Eiscue',
  'indeedee-male': 'Indeedee',
  'morpeko-full-belly': 'Morpeko',
  'urshifu-single-strike': 'Urshifu',
  'basculegion-male': 'Basculegion',
  'enamorus-incarnate': 'Enamorus',
  'oinkologne-male': 'Oinkologne',
  'maushold-family-of-four': 'Maushold',
  'squawkabilly-green-plumage': 'Squawkabilly',
  'palafin-zero': 'Palafin',
  'tatsugiri-curly': 'Tatsugiri',
  'dudunsparce-two-segment': 'Dudunsparce',
  'wo-chien': 'Wo-Chien',
  'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu',
  'chi-yu': 'Chi-Yu',
};

const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

export const artworkUrl = (id) => `${ARTWORK_BASE}/${id}.png`;
export const shinyArtworkUrl = (id) => `${ARTWORK_BASE}/shiny/${id}.png`;

export const padId = (id) => `#${String(id).padStart(4, '0')}`;

export function formatName(name) {
  if (NAME_OVERRIDES[name]) return NAME_OVERRIDES[name];
  return name
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}
