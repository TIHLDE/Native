# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native + Expo mobile app for the TIHLDE student organization. Handles events, career postings, user authentication, and QR check-in. iOS and Android via Expo managed workflow.

## Commands

```bash
npm install              # Install dependencies
npx expo start           # Start development server
expo run:ios             # Run on iOS simulator
expo run:android         # Run on Android emulator
npx jest --watchAll      # Run tests (watch mode)
npx jest path/to/test    # Run a single test
expo lint                # Lint
```

## Architecture

### Routing (Expo Router - file-based)

```
app/
├── _layout.tsx              # Root: providers (theme, auth, react-query, gestures, toast)
├── index.tsx                # Splash → redirects to /login or /arrangementer
├── (auth)/login.tsx         # Login screen
└── (app)/
    ├── (tabs)/              # Bottom tab navigator
    │   ├── arrangementer/   # Events (infinite scroll list + details)
    │   └── karriere/        # Job postings
    ├── profil/              # User profile
    └── (modals)/            # Slide-from-right modal screens (route group)
```

Modals use `router.push("/(modals)/...")` with `presentation: "card"` and `animation: "slide_from_right"`. Dynamic params via `useLocalSearchParams()`.

### Data Layer

- **API calls** live in `actions/` with direct `fetch()` calls against `https://api.tihlde.org` (configurable in `actions/constant.ts`)
- **Types** in `actions/types/` (Event, User, Registration, LoginData, etc.)
- **Server state** via `@tanstack/react-query` (infinite queries for lists, standard queries for details)
- **Auth state** via React Context (`context/auth.tsx`) with token in `expo-secure-store`

### Styling

- **NativeWind** (TailwindCSS for React Native) with `class-variance-authority`
- Dark/light mode via CSS class strategy, persisted in AsyncStorage
- Custom color palette defined as HSL variables in `global.css` and `tailwind.config.js`
- UI primitives in `components/ui/` built on `@rn-primitives/*`

### Path Aliases

- `@/*` and `~/*` both resolve to the project root

### Key Patterns

- Feature components in `components/[feature]/`, reusable UI in `components/ui/`
- Custom hooks in `lib/` (`useColorScheme`, `useRefresh`, `useInterval`)
- Storage helpers in `lib/storage/` (tokenStore with SecureStore, themeStore with AsyncStorage)
- Bottom sheets via `@gorhom/bottom-sheet`
- Icons from `lucide-react-native`
