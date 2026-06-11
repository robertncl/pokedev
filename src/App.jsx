import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchIndex, fetchPokemon, fetchTypeMembers } from './api.js';
import { PAGE_SIZE } from './constants.js';
import { useDebounced, useFavorites, useTheme } from './hooks.js';
import DetailModal from './components/DetailModal.jsx';
import Header from './components/Header.jsx';
import Pokeball from './components/Pokeball.jsx';
import PokemonCard from './components/PokemonCard.jsx';
import SkeletonCard from './components/SkeletonCard.jsx';
import TypeFilter from './components/TypeFilter.jsx';

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [favorites, toggleFavorite] = useFavorites();

  const [index, setIndex] = useState(null);
  const [bootError, setBootError] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  const [search, setSearch] = useState('');
  const query = useDebounced(search.trim(), 200);
  const [selectedType, setSelectedType] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [typeMembers, setTypeMembers] = useState({});
  const [details, setDetails] = useState({});
  const [page, setPage] = useState(1);
  const [gridError, setGridError] = useState(false);
  const [selected, setSelected] = useState(null);
  const searchRef = useRef(null);

  // Load the master index (name + id of every Pokémon) once.
  useEffect(() => {
    let cancelled = false;
    setBootError(false);
    fetchIndex()
      .then((list) => {
        if (!cancelled) setIndex(list);
      })
      .catch(() => {
        if (!cancelled) setBootError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  // Load the id set for the selected type on demand.
  useEffect(() => {
    if (!selectedType || typeMembers[selectedType]) return;
    let cancelled = false;
    fetchTypeMembers(selectedType)
      .then((members) => {
        if (!cancelled) setTypeMembers((prev) => ({ ...prev, [selectedType]: members }));
      })
      .catch(() => {
        if (!cancelled) setGridError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedType, typeMembers, retryTick]);

  // null means "type members still loading"
  const visible = useMemo(() => {
    if (!index) return [];
    if (selectedType && !typeMembers[selectedType]) return null;
    let list = index;
    if (selectedType) list = list.filter((p) => typeMembers[selectedType].has(p.id));
    if (showFavorites) list = list.filter((p) => favorites.has(p.id));
    const q = normalize(query);
    if (q) list = list.filter((p) => normalize(p.name).includes(q) || String(p.id) === q);
    return list;
  }, [index, selectedType, typeMembers, showFavorites, favorites, query]);

  const slice = useMemo(() => (visible ? visible.slice(0, page * PAGE_SIZE) : []), [visible, page]);

  // Fetch full details for every Pokémon in the current slice that we
  // haven't loaded yet. Failures leave skeletons and raise the banner.
  useEffect(() => {
    const missing = slice.filter((p) => !details[p.id]);
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(
      missing.map((p) => fetchPokemon(p.name).then((d) => [p.id, d], () => null))
    ).then((pairs) => {
      if (cancelled) return;
      const loaded = pairs.filter(Boolean);
      if (loaded.length > 0) setDetails((prev) => ({ ...prev, ...Object.fromEntries(loaded) }));
      if (loaded.length < pairs.length) setGridError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slice, details, retryTick]);

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
  const handleRetry = () => {
    setGridError(false);
    setRetryTick((t) => t + 1);
  };
  const openById = useCallback(async (id) => {
    try {
      setSelected(await fetchPokemon(id));
    } catch {
      /* stay on the current Pokémon */
    }
  }, []);

  if (bootError) {
    return (
      <div className="boot">
        <Pokeball size={64} />
        <p>Couldn't reach PokéAPI. Check your connection.</p>
        <button className="neu-btn pill-btn" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="boot">
        <Pokeball size={64} spinning />
        <p>Loading Pokédex…</p>
      </div>
    );
  }

  const membersLoading = visible === null;

  return (
    <div className="app">
      <Header
        search={search}
        onSearchChange={handleSearch}
        searchRef={searchRef}
        showFavorites={showFavorites}
        onToggleFavorites={handleToggleFavorites}
        favoriteCount={favorites.size}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <TypeFilter selected={selectedType} onSelect={handleSelectType} />
      <main>
        {gridError && (
          <div className="banner" role="alert">
            <span>Some Pokémon failed to load.</span>
            <button className="neu-btn pill-btn" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}
        {membersLoading ? (
          <div className="grid">
            {Array.from({ length: 12 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <Pokeball size={56} />
            <p>No Pokémon found{showFavorites ? ' in your favorites' : ''}.</p>
            <button className="neu-btn pill-btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="result-count">
              Showing {slice.length} of {visible.length} Pokémon
            </p>
            <div className="grid">
              {slice.map((p) =>
                details[p.id] ? (
                  <PokemonCard
                    key={p.id}
                    pokemon={details[p.id]}
                    isFavorite={favorites.has(p.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelect={setSelected}
                  />
                ) : (
                  <SkeletonCard key={p.id} />
                )
              )}
            </div>
            {slice.length < visible.length && (
              <button className="neu-btn load-more" onClick={() => setPage((p) => p + 1)}>
                Load More
              </button>
            )}
          </>
        )}
      </main>
      <footer className="footer">
        <p>
          Data from{' '}
          <a href="https://pokeapi.co" target="_blank" rel="noreferrer">
            PokéAPI
          </a>{' '}
          · Built with React + Vite · Pokémon and Pokémon character names are trademarks of
          Nintendo.
        </p>
      </footer>
      {selected && (
        <DetailModal
          pokemon={selected}
          isFavorite={favorites.has(selected.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelected(null)}
          onNavigate={openById}
        />
      )}
    </div>
  );
}
