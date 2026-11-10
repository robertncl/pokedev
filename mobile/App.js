import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono/600SemiBold';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchIndex, fetchPokemon, fetchTypeMembers } from './src/api.js';
import { PAGE_SIZE } from './src/constants.js';
import { useFavorites } from './src/useFavorites.js';
import { font, RADIUS, SPACE, TEXT, ThemeProvider, useTheme } from './src/theme.js';
import IconButton from './src/components/IconButton.js';
import Pokeball from './src/components/Pokeball.js';
import PokemonCard from './src/components/PokemonCard.js';
import SkeletonCard from './src/components/SkeletonCard.js';
import TypeFilter from './src/components/TypeFilter.js';
import DetailModal from './src/components/DetailModal.js';

const normalize = (v) => v.toLowerCase().replace(/[^a-z0-9]/g, '');

// Keep the splash up until the fonts are ready, so text never re-flows.
SplashScreen.preventAutoHideAsync().catch(() => {});

const FONT_FILES = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
};

// Buttons: ink primary (one per view) and bordered secondary. A press is a
// color step, never a scale.
function Button({ label, onPress, variant = 'secondary' }) {
  const { colors } = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        height: 44,
        justifyContent: 'center',
        paddingHorizontal: SPACE[5],
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: primary ? colors.primary : colors.borderControl,
        backgroundColor: primary
          ? pressed
            ? colors.primaryActive
            : colors.primary
          : pressed
            ? colors.surfaceHover
            : colors.surfaceRaised,
        boxShadow: colors.shadowSm,
      })}
    >
      <Text style={{ ...font(500), fontSize: TEXT.sm, letterSpacing: -0.15, color: primary ? colors.onPrimary : colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Dex() {
  const { colors, scheme, toggle } = useTheme();
  const insets = useSafeAreaInsets();
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

  const statusText = { ...font(400), fontSize: TEXT.sm, color: colors.textMuted, textAlign: 'center' };

  if (bootError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: SPACE[6], gap: SPACE[5] }}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Pokeball size={48} color={colors.mark} />
        <Text style={statusText}>Couldn't reach PokéAPI. Check your connection and try again.</Text>
        <Button label="Try again" variant="primary" onPress={() => setRetryTick((t) => t + 1)} />
      </View>
    );
  }

  if (!index) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', gap: SPACE[4] }}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Pokeball size={40} color={colors.mark} spinning />
        <Text style={statusText}>Loading Pokédex…</Text>
      </View>
    );
  }

  const membersLoading = visible === null;

  // Full-width app bar at zero elevation, separated only by its hairline.
  const appBar = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 56,
        paddingHorizontal: SPACE[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.canvas,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE[2] }}>
        <Pokeball size={24} color={colors.mark} />
        <Text accessibilityRole="header" style={{ ...font(700), fontSize: TEXT.lg, letterSpacing: -0.2, color: colors.text }}>
          PokéDev
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: SPACE[2] }}>
        <IconButton
          icon={showFavorites ? 'heart' : 'heart-outline'}
          label="Toggle favorites filter"
          selected={showFavorites}
          onPress={onToggleFavorites}
        />
        <IconButton
          icon={scheme === 'dark' ? 'weather-sunny' : 'weather-night'}
          label="Toggle light/dark theme"
          onPress={toggle}
        />
      </View>
    </View>
  );

  const header = (
    <View style={{ paddingTop: SPACE[4], gap: SPACE[4] }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: SPACE[2],
          marginHorizontal: SPACE[4],
          height: 44,
          paddingHorizontal: SPACE[3],
          borderWidth: 1,
          borderColor: colors.borderStrong,
          borderRadius: RADIUS.md,
          backgroundColor: colors.surfaceRaised,
          boxShadow: colors.shadowSm,
        }}
      >
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSubtle} />
        <TextInput
          value={search}
          onChangeText={onSearch}
          placeholder="Search name or number…"
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel="Search Pokémon by name or number"
          selectionColor={colors.selected}
          style={{ ...font(400), flex: 1, color: colors.text, fontSize: TEXT.md }}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {search ? (
          <Pressable onPress={() => onSearch('')} hitSlop={12} accessibilityLabel="Clear search">
            <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <TypeFilter selected={selectedType} onSelect={onSelectType} />

      {!membersLoading && (
        <Text style={{ ...font(400), paddingHorizontal: SPACE[4], color: colors.textMuted, fontSize: TEXT.sm, fontVariant: ['tabular-nums'] }}>
          Showing {slice.length} of {visible.length} Pokémon
        </Text>
      )}
    </View>
  );

  const data = membersLoading
    ? Array.from({ length: 6 }, (_, i) => ({ id: `skeleton-${i}`, skeleton: true }))
    : slice;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas, paddingTop: insets.top }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {appBar}
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: SPACE[3], paddingHorizontal: SPACE[4] }}
        contentContainerStyle={{ gap: SPACE[3], paddingBottom: insets.bottom + SPACE[8] }}
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
            <View
              style={{
                alignItems: 'center',
                marginHorizontal: SPACE[4],
                paddingVertical: SPACE[12],
                paddingHorizontal: SPACE[6],
                gap: SPACE[4],
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: RADIUS.lg,
                backgroundColor: colors.surface,
              }}
            >
              <Pokeball size={40} color={colors.textSubtle} />
              <Text style={{ ...font(400), fontSize: TEXT.md, color: colors.text, textAlign: 'center' }}>
                No Pokémon found{showFavorites ? ' in your favorites' : ''}.
              </Text>
              <Button label="Clear filters" onPress={clearFilters} />
            </View>
          ) : null
        }
        ListFooterComponent={
          hasMore && !membersLoading ? (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACE[3], paddingVertical: SPACE[6] }}>
              <Pokeball size={20} color={colors.mark} spinning />
              <Text style={statusText}>Loading more…</Text>
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
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Dex />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
