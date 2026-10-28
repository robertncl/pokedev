import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { PAGE_SIZE } from './constants.js';
import { POKEDEX } from './data.js';
import { useFavorites } from './hooks.js';
import { useI18n } from './i18n/index.js';
import DetailModal from './components/DetailModal.jsx';
import Header from './components/Header.jsx';
import Pokeball from './components/Pokeball.jsx';
import PokemonCard from './components/PokemonCard.jsx';
import TypeFilter from './components/TypeFilter.jsx';

// Arabic-Indic, Persian, Devanagari and Bengali digits.
const NATIVE_DIGITS = /[\u0660-\u0669\u06f0-\u06f9\u0966-\u096f\u09e6-\u09ef]/g;
const DIGIT_ZEROS = [0x660, 0x6f0, 0x966, 0x9e6];

// Folds what shouldn't matter when searching: case, accents ("flabebe" finds
// Flabébé), full-width characters, hiragana vs katakana, native digits,
// spaces and punctuation.
const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
    .replace(NATIVE_DIGITS, (c) => {
      const code = c.charCodeAt(0);
      return String(code - DIGIT_ZEROS.find((zero) => code >= zero && code <= zero + 9));
    })
    .replace(/[^\p{L}\p{M}\p{N}]/gu, '');

export default function App() {
  const i18n = useI18n();
  const { t, formatNumber } = i18n;
  const [favorites, toggleFavorite] = useFavorites();
  const [search, setSearch] = useState('');
  // The input updates immediately; the grid catches up at lower priority.
  const query = useDeferredValue(normalize(search));
  const [selectedType, setSelectedType] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const searchRef = useRef(null);
  const sentinelRef = useRef(null);

  // Names match in the current language and in English. A query can't
  // contain the newline, so a match never spans both.
  const searchKeys = useMemo(
    () => new Map(POKEDEX.map((p) => [p.id, `${normalize(i18n.pokemonName(p))}\n${normalize(p.name)}`])),
    [i18n]
  );

  // Only a dependency while filtering by favorites, so toggling a heart
  // otherwise leaves the list (and every other card) untouched.
  const favoritesFilter = showFavorites ? favorites : null;
  const visible = useMemo(
    () =>
      POKEDEX.filter(
        (p) =>
          (!selectedType || p.types.includes(selectedType)) &&
          (!favoritesFilter || favoritesFilter.has(p.id)) &&
          (!query || searchKeys.get(p.id).includes(query) || String(p.id) === query)
      ),
    [selectedType, favoritesFilter, query, searchKeys]
  );
  const slice = useMemo(() => visible.slice(0, page * PAGE_SIZE), [visible, page]);
  const hasMore = slice.length < visible.length;

  // Load the next page once the sentinel nears the viewport. Re-observing
  // after each page keeps going if the sentinel is still in range (tall screens).
  useEffect(() => {
    if (!hasMore) return;
    const target = sentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setPage((p) => p + 1);
      },
      { rootMargin: '600px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, page]);

  // "/" focuses the search field from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };
  const handleSelectType = (type) => {
    setSelectedType((prev) => (prev === type ? '' : type));
    setPage(1);
  };
  const handleToggleFavorites = () => {
    setShowFavorites((v) => !v);
    setPage(1);
  };
  const handleClearFilters = () => {
    setSearch('');
    setSelectedType('');
    setShowFavorites(false);
    setPage(1);
  };

  const [footerBefore, footerAfter] = t('footer.text').split('{source}');

  return (
    <div className="container">
      <Header
        search={search}
        onSearchChange={handleSearch}
        searchRef={searchRef}
        showFavorites={showFavorites}
        onToggleFavorites={handleToggleFavorites}
        favoriteCount={favorites.size}
      />
      <TypeFilter selected={selectedType} onSelect={handleSelectType} />

      <main>
        {visible.length === 0 ? (
          <div className="empty">
            <Pokeball size={56} />
            <p>{t(showFavorites ? 'results.emptyFavorites' : 'results.empty')}</p>
            <button type="button" className="button" onClick={handleClearFilters}>
              {t('results.clear')}
            </button>
          </div>
        ) : (
          <>
            <p className="results">
              {t('results.count', { shown: formatNumber(slice.length), total: formatNumber(visible.length) })}
            </p>
            <div className="grid">
              {slice.map((p, i) => (
                <PokemonCard
                  key={p.id}
                  pokemon={p}
                  index={i}
                  isFavorite={favorites.has(p.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
            {hasMore && (
              <div ref={sentinelRef} className="loading-more">
                <Pokeball size={26} spinning />
                {t('results.loadingMore')}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        {footerBefore}
        <a href="https://pokeapi.co" target="_blank" rel="noreferrer">
          PokéAPI
        </a>
        {footerAfter}
      </footer>

      {selectedId && (
        <DetailModal
          id={selectedId}
          isFavorite={favorites.has(selectedId)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedId(null)}
          onNavigate={setSelectedId}
        />
      )}
    </div>
  );
}
