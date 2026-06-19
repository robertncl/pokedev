# PokéDev — Android (React Native / Expo)

The Android version of the PokéDev Pokédex, built with **Expo SDK 56** / React Native.
It mirrors the web app's features against the same [PokéAPI](https://pokeapi.co):

- Browse all 1025 Pokémon in a 2-column grid with infinite scroll
- Search by name or number (debounced)
- Filter by type (horizontal chip rail)
- Favorites (persisted with AsyncStorage)
- Light / dark theme (follows system, with a manual toggle)
- Detail sheet: artwork (+ shiny toggle), flavor text, height/weight/XP, abilities,
  base stats, and a tappable evolution chain

## Project layout

```
mobile/
  App.js                 # main screen: list, search, filters, infinite scroll
  src/
    api.js               # PokéAPI client (shared with web, framework-agnostic)
    constants.js         # type colors, name overrides, formatters (shared with web)
    theme.js             # light/dark color tokens + ThemeProvider
    useFavorites.js      # AsyncStorage-backed favorites
    components/          # PokemonCard, TypeFilter, DetailModal, EvolutionChain, …
```

`api.js` and `constants.js` are byte-for-byte the same logic as the web app — only the
UI layer differs (React Native components instead of Mantine/DOM).

## Run in development

```bash
cd mobile
npm install
npx expo start            # then press 'a', or scan the QR with Expo Go
```

## Build an APK / AAB

> **Note:** A local Gradle build requires an **x86_64** machine. This repo was developed
> on an aarch64 (ARM) WSL2 host, where Google's Android NDK — which ships x86_64-only
> Linux binaries — cannot run, so native C++ (`expo-modules-core`) won't compile locally
> here. Use EAS (cloud) or an x86_64 machine. The JS bundles cleanly for Android
> (`npx expo export --platform android`), and `npx expo-doctor` passes 21/21.

### Option A — EAS Build (recommended, cloud, any host)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview     # installable APK
eas build -p android --profile production   # Play Store AAB
```

Profiles are defined in [eas.json](eas.json) (`preview` → APK, `production` → AAB).

### Option B — Local build on an x86_64 machine (or Android Studio on Windows)

```bash
cd mobile
npx expo prebuild --platform android   # generates the native android/ project
cd android
./gradlew assembleDebug                 # outputs app/build/outputs/apk/debug/app-debug.apk
```

Requirements: JDK 17, Android SDK (platform 35, build-tools 35), and the NDK that
Gradle auto-installs. On Windows, just open the generated `android/` folder in
Android Studio and Run.

## Config

App identity lives in [app.json](app.json) — name `PokéDev`, Android package
`com.pokedev.app`, adaptive icon, splash, and automatic (system) color scheme.
