import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Anchor,
  Button,
  Center,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { fetchIndex, fetchPokemon, fetchTypeMembers } from './api.js';
import { PAGE_SIZE } from './constants.js';
import { useFavorites } from './hooks.js';
import DetailModal from './components/DetailModal.jsx';
import Header from './components/Header.jsx';
import Pokeball from './components/Pokeball.jsx';
import PokemonCard from './components/PokemonCard.jsx';
import SkeletonCard from './components/SkeletonCard.jsx';
import TypeFilter from './components/TypeFilter.jsx';

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export default function App() {
  const [favorites, toggleFavorite] = useFavorites();

  const [index, setIndex] = useState(null);
  const [bootError, setBootError] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  const [search, setSearch] = useState('');
  const [query] = useDebouncedValue(search.trim(), 200);
  const [selectedType, setSelectedType] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [typeMembers, setTypeMembers] = useState({});
  const [details, setDetails] = useState({});
  const [page, setPage] = useState(1);
  const [gridError, setGridError] = useState(false);
  const [selected, setSelected] = useState(null);
  const searchRef = useRef(null);
  const sentinelRef = useRef(null);

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

  // Load the next page automatically once the sentinel scrolls into view.
  const hasMore = visible !== null && slice.length < visible.length;
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
  }, [hasMore]);

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
      <Center mih="100vh" p="md">
        <Stack align="center" gap="lg">
          <Pokeball size={64} />
          <Text c="dimmed" fw={700} ta="center">
            Couldn't reach PokéAPI. Check your connection.
          </Text>
          <Button radius="xl" size="md" onClick={handleRetry}>
            Try Again
          </Button>
        </Stack>
      </Center>
    );
  }

  if (!index) {
    return (
      <Center mih="100vh" p="md">
        <Stack align="center" gap="lg">
          <Pokeball size={64} spinning />
          <Text c="dimmed" fw={700}>
            Loading Pokédex…
          </Text>
        </Stack>
      </Center>
    );
  }

  const membersLoading = visible === null;

  return (
    <Container size="lg" py="xl">
      <Header
        search={search}
        onSearchChange={handleSearch}
        searchRef={searchRef}
        showFavorites={showFavorites}
        onToggleFavorites={handleToggleFavorites}
        favoriteCount={favorites.size}
      />
      <TypeFilter selected={selectedType} onSelect={handleSelectType} />

      {gridError && (
        <Alert color="red" radius="md" mb="lg" withCloseButton onClose={() => setGridError(false)}>
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Text fw={600}>Some Pokémon failed to load.</Text>
            <Button size="xs" radius="xl" variant="white" color="red" onClick={handleRetry}>
              Retry
            </Button>
          </Group>
        </Alert>
      )}

      {membersLoading ? (
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5 }} spacing="lg">
          {Array.from({ length: 12 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </SimpleGrid>
      ) : visible.length === 0 ? (
        <Center py={64}>
          <Stack align="center" gap="lg">
            <Pokeball size={56} />
            <Text c="dimmed" fw={700} ta="center">
              No Pokémon found{showFavorites ? ' in your favorites' : ''}.
            </Text>
            <Button radius="xl" variant="default" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Stack>
        </Center>
      ) : (
        <>
          <Text c="dimmed" fw={700} size="sm" mb="md">
            Showing {slice.length} of {visible.length} Pokémon
          </Text>
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5 }} spacing="lg">
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
          </SimpleGrid>
          {hasMore && (
            <Center ref={sentinelRef} py="xl">
              <Group gap="sm">
                <Pokeball size={26} spinning />
                <Text c="dimmed" fw={700}>
                  Loading more…
                </Text>
              </Group>
            </Center>
          )}
        </>
      )}

      <Text c="dimmed" size="sm" ta="center" mt={56} lh={1.7}>
        Data from{' '}
        <Anchor href="https://pokeapi.co" target="_blank" rel="noreferrer" inherit>
          PokéAPI
        </Anchor>{' '}
        · Built with React + Mantine · Pokémon and Pokémon character names are trademarks of Nintendo.
      </Text>

      {selected && (
        <DetailModal
          pokemon={selected}
          isFavorite={favorites.has(selected.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelected(null)}
          onNavigate={openById}
        />
      )}
    </Container>
  );
}
