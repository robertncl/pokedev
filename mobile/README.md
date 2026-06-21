# PokéDev — Mobile (iOS & Android, React Native / Expo)

The mobile version of the PokéDev Pokédex, built with **Expo SDK 56** / React Native.
One codebase targets **both iOS and Android**, with platform-correct safe areas
(notch / Dynamic Island / home indicator via `react-native-safe-area-context`).
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
npx expo start            # press 'a' for Android, 'i' for iOS simulator,
                          # or scan the QR with Expo Go (Android) / Camera (iOS)
```

## Build — Android (APK / AAB)

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

## Build — iOS (.ipa / simulator)

> **Note:** Apple's build toolchain is **macOS-only** — an `.ipa` cannot be compiled on
> Linux or Windows at all. Use EAS (cloud, no Mac needed) or a Mac with Xcode. The JS
> bundles cleanly for iOS here (`npx expo export --platform ios`, 669 modules) and
> `npx expo-doctor` passes 21/21.

### Option A — EAS Build (recommended, cloud, no Mac required)

```bash
npm install -g eas-cli
eas login
eas build -p ios --profile preview      # simulator/internal build
eas build -p ios --profile production    # App Store build (needs an Apple Developer account)
```

A production build / App Store submission requires an Apple Developer Program membership
($99/yr) for code signing; EAS manages the certificates and provisioning profiles for you.

### Option B — Local build on macOS with Xcode

```bash
cd mobile
npx expo prebuild --platform ios   # generates the native ios/ project
npx expo run:ios                    # build & launch in the iOS Simulator
# or open ios/PokéDev.xcworkspace in Xcode and Run on a device/simulator
```

Requirements: macOS, Xcode, and CocoaPods.

## Config

App identity lives in [app.json](app.json) — name `PokéDev`, Android package
`com.pokedev.app`, iOS bundle id `com.pokedev.app`, adaptive icon, splash, and
automatic (system) color scheme.
