import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { PAGE_SIZE } from './constants.js';
import { POKEDEX } from './data.js';
import { useFavorites } from './hooks.js';
import DetailModal from './components/DetailModal.jsx';
import Header from './components/Header.jsx';
import Pokeball from './components/Pokeball.jsx';
import PokemonCard from './components/PokemonCard.jsx';
import TypeFilter from './components/TypeFilter.jsx';

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const searchKeys = new Map(POKEDEX.map((pokemon) => [pokemon.id, normalize(pokemon.name)]));

export default function App() {
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
    [selectedType, favoritesFilter, query]
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
            <p>No Pokémon found{showFavorites ? ' in your favorites' : ''}.</p>
            <button type="button" className="button" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="results">
              Showing {slice.length} of {visible.length} Pokémon
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
                Loading more…
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        Data from{' '}
        <a href="https://pokeapi.co" target="_blank" rel="noreferrer">
          PokéAPI
        </a>{' '}
        · Built with React · Pokémon and Pokémon character names are trademarks of Nintendo.
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
