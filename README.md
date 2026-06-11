# PokéDev

A Pokédex web app with a **neumorphic (soft UI)** design. Browse, search, and filter the first 1025 Pokémon, inspect stats and evolution chains, and keep a list of favorites — in light or dark mode.

## Features

- 🔍 Instant search by name or National Dex number (press `/` to focus)
- 🏷️ Filter by any of the 18 types, combinable with search and favorites
- ❤️ Favorites, saved to localStorage
- 📊 Detail view with Pokédex entry, abilities, base stats, and a clickable evolution chain
- ✨ Shiny artwork toggle
- 🌗 Neumorphic light & dark themes (remembers your choice, respects system preference)
- ♿ Keyboard navigable, honors reduced-motion preference

## Getting Started

Requires Node.js 18+.

```sh
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Tech Stack

- React 19 + Vite
- Hand-rolled neumorphism in vanilla CSS — no UI framework
- [PokéAPI](https://pokeapi.co) for all data and official artwork

## Project Structure

```
src/
  api.js         # PokéAPI client with promise caching
  constants.js   # type colors, stat labels, display-name overrides
  hooks.js       # theme, favorites, debounced value
  App.jsx        # state, filtering, pagination, modal orchestration
  components/    # header, cards, detail modal, stats, evolution chain…
  index.css      # design tokens + all neumorphic styles
```

## Credits

Data and sprites from [PokéAPI](https://pokeapi.co). Pokémon and Pokémon character names are trademarks of Nintendo / Game Freak / Creatures Inc. This is a fan-made demo project.
