import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchIndex, fetchPokemon, fetchTypeMembers } from './src/api.js';
import { PAGE_SIZE } from './src/constants.js';
import { useFavorites } from './src/useFavorites.js';
import { ThemeProvider, useTheme } from './src/theme.js';
import Pokeball from './src/components/Pokeball.js';
import PokemonCard from './src/components/PokemonCard.js';
import SkeletonCard from './src/components/SkeletonCard.js';
import TypeFilter from './src/components/TypeFilter.js';
import DetailModal from './src/components/DetailModal.js';

const normalize = (v) => v.toLowerCase().replace(/[^a-z0-9]/g, '');
const topInset = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;

function Dex() {
  const { colors, scheme, toggle } = useTheme();
  const [favorites, toggleFavorite] = useFavorites();

  const [index, setIndex] = useState(null);
  const [bootError, setBootError] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [typeMembers, setTypeMembers] = useState({});
  const [details, setDetails] = useState({});
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 200);
    return () => clearTimeout(t);
  }, [search]);

  // master index (name + id of every Pokémon)
  useEffect(() => {
    let cancelled = false;
    setBootError(false);
    fetchIndex()
      .then((l) => {
        if (!cancelled) setIndex(l);
      })
      .catch(() => {
        if (!cancelled) setBootError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  // id set for the selected type, on demand
  useEffect(() => {
    if (!selectedType || typeMembers[selectedType]) return;
    let cancelled = false;
    fetchTypeMembers(selectedType)
      .then((m) => {
        if (!cancelled) setTypeMembers((p) => ({ ...p, [selectedType]: m }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedType, typeMembers]);

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
  const hasMore = visible !== null && slice.length < visible.length;

  // fetch full details for the current slice
  useEffect(() => {
    const missing = slice.filter((p) => !details[p.id]);
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(missing.map((p) => fetchPokemon(p.name).then((d) => [p.id, d], () => null))).then((pairs) => {
      if (cancelled) return;
      const loaded = pairs.filter(Boolean);
      if (loaded.length) setDetails((prev) => ({ ...prev, ...Object.fromEntries(loaded) }));
    });
    return () => {
      cancelled = true;
    };
  }, [slice, details]);

  const resetPage = () => setPage(1);
  const onSearch = (v) => {
    setSearch(v);
    resetPage();
  };
  const onSelectType = (t) => {
    setSelectedType((p) => (p === t ? '' : t));
    resetPage();
  };
  const onToggleFavorites = () => {
    setShowFavorites((v) => !v);
    resetPage();
  };
  const clearFilters = () => {
    setSearch('');
    setSelectedType('');
    setShowFavorites(false);
    resetPage();
  };
  const openById = useCallback(async (id) => {
    try {
      setSelected(await fetchPokemon(id));
    } catch {
      /* stay on current Pokémon */
    }
  }, []);

  const iconBtn = (active) => ({
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: active ? colors.accent + '22' : colors.surface,
  });

  if (bootError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 18 }}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Pokeball size={56} color={colors.accent} />
        <Text style={{ color: colors.dimmed, fontWeight: '700', textAlign: 'center' }}>
          Couldn't reach PokéAPI. Check your connection.
        </Text>
        <Pressable
          onPress={() => setRetryTick((t) => t + 1)}
          style={{ backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 28 }}
        >
          <Text style={{ color: colors.onAccent, fontWeight: '800' }}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!index) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Pokeball size={56} color={colors.accent} spinning />
        <Text style={{ color: colors.dimmed, fontWeight: '700' }}>Loading Pokédex…</Text>
      </View>
    );
  }

  const membersLoading = visible === null;

  const header = (
    <View>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pokeball size={34} color={colors.accent} />
            <View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
                Poké<Text style={{ color: colors.accent }}>Dev</Text>
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.dimmed, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Pokédex
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={onToggleFavorites} style={iconBtn(showFavorites)} accessibilityLabel="Toggle favorites filter">
              <MaterialCommunityIcons name={showFavorites ? 'heart' : 'heart-outline'} size={20} color={showFavorites ? colors.accent : colors.dimmed} />
            </Pressable>
            <Pressable onPress={toggle} style={iconBtn(false)} accessibilityLabel="Toggle light/dark theme">
              <MaterialCommunityIcons name={scheme === 'dark' ? 'weather-sunny' : 'weather-night'} size={20} color={colors.dimmed} />
            </Pressable>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 999,
            paddingHorizontal: 14,
            height: 46,
            marginBottom: 14,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={colors.dimmed} />
          <TextInput
            value={search}
            onChangeText={onSearch}
            placeholder="Search name or number…"
            placeholderTextColor={colors.dimmed}
            style={{ flex: 1, color: colors.text, fontSize: 15 }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {search ? (
            <Pressable onPress={() => onSearch('')} hitSlop={8} accessibilityLabel="Clear search">
              <MaterialCommunityIcons name="close" size={18} color={colors.dimmed} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <TypeFilter selected={selectedType} onSelect={onSelectType} />

      {!membersLoading && (
        <Text style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, color: colors.dimmed, fontWeight: '700', fontSize: 13 }}>
          Showing {slice.length} of {visible.length} Pokémon
        </Text>
      )}
    </View>
  );

  const data = membersLoading
    ? Array.from({ length: 6 }, (_, i) => ({ id: `skeleton-${i}`, skeleton: true }))
    : slice;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: topInset }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 28 }}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          if (hasMore) setPage((p) => p + 1);
        }}
        renderItem={({ item }) => {
          if (item.skeleton) return <SkeletonCard />;
          const full = details[item.id];
          return full ? (
            <PokemonCard
              pokemon={full}
              isFavorite={favorites.has(item.id)}
              onToggleFavorite={toggleFavorite}
              onPress={() => setSelected(full)}
            />
          ) : (
            <SkeletonCard />
          );
        }}
        ListEmptyComponent={
          !membersLoading ? (
            <View style={{ alignItems: 'center', padding: 48, gap: 16 }}>
              <Pokeball size={48} color={colors.dimmed} />
              <Text style={{ color: colors.dimmed, fontWeight: '700' }}>
                No Pokémon found{showFavorites ? ' in your favorites' : ''}.
              </Text>
              <Pressable
                onPress={clearFilters}
                style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 24 }}
              >
                <Text style={{ color: colors.text, fontWeight: '800' }}>Clear Filters</Text>
              </Pressable>
            </View>
          ) : null
        }
        ListFooterComponent={
          hasMore && !membersLoading ? (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 22 }}>
              <Pokeball size={22} color={colors.accent} spinning />
              <Text style={{ color: colors.dimmed, fontWeight: '700' }}>Loading more…</Text>
            </View>
          ) : null
        }
      />

      {selected && (
        <DetailModal
          pokemon={selected}
          isFavorite={favorites.has(selected.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelected(null)}
          onNavigate={openById}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Dex />
    </ThemeProvider>
  );
}
