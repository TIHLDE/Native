# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native + Expo mobile app for the TIHLDE student organization. Handles events, career postings, user authentication, and QR check-in. iOS and Android via Expo managed workflow.

## Commands

```bash
npm install              # Install dependencies
npx expo start           # Start development server
npx expo start --clear   # Start with cleared Metro cache (use after package upgrades)
expo run:ios             # Run on iOS simulator
expo run:android         # Run on Android emulator
npx jest --watchAll      # Run tests (watch mode)
npx jest path/to/test    # Run a single test
expo lint                # Lint
npx expo-doctor@latest   # Check project health and dependency compatibility
```

## Architecture

### Routing (Expo Router - file-based)

```
app/
├── _layout.tsx              # Root: providers (theme, auth, react-query, gestures, toast)
├── index.tsx                # Splash → redirects to /login or /arrangementer
├── (auth)/login.tsx         # Login screen
└── (app)/
    ├── (tabs)/              # Bottom tab navigator (NativeTabs)
    │   ├── grupper/         # The user's groups (list only; details are a modal)
    │   ├── karriere/        # Job postings
    │   ├── bot/             # Give a fine — group picker, then the fines flow
    │   ├── arrangementer/   # Events (infinite scroll list + details)
    │   └── profil/          # User profile
    └── (modals)/            # Slide-from-right modal screens (route group)
        ├── gruppe/[groupSlug]/   # One group: fines, laws, leaderboard
        ├── boter/[groupSlug]/    # The give-a-fine flow (laws → users → confirm)
        └── utlegg/               # Expenses, reached from the icon in grupper's header
```

Two tabs list groups, deliberately: `bot/` shows only groups with fines enabled and
leads into the give-a-fine flow, while `grupper/` shows every group and leads to the
read-only group page. Giving a fine stays a one-tap action, which is worth the overlap.

Modals use `router.push("/(modals)/...")` with `presentation: "card"` and `animation: "slide_from_right"`. Dynamic params via `useLocalSearchParams()`.

### Data Layer

- **API calls** live in `actions/` and go against Photon — `BASE_URL` is `https://photon.tihlde.org` (override with `EXPO_PUBLIC_PHOTON_URL`), and every REST route lives under `API_URL = ${BASE_URL}/api` (see `actions/constant.ts`)
- **Types** in `actions/types/` with barrel export from `index.ts` (Event, User, Registration, LoginData, etc.)
- **Photon translation layer** in `actions/photon.ts` — Photon answers in camelCase with partly different shapes, while the screens were written against the old snake_case forms. `toUser`, `toGroup`, `toEvent`, `toRegistration`, `toLaw`, `toJobTypeKey` and friends convert in this one place so the screens stay untouched. New actions should map Photon responses here rather than reshaping data in the screen.
- **Server state** via `@tanstack/react-query` (infinite queries for lists, standard queries for details)
- **Auth state** via React Context (`context/auth.tsx`); OAuth session (access token, refresh token, expiry) in `expo-secure-store` via `lib/storage/tokenStore.ts`

### Styling

- **NativeWind** (TailwindCSS for React Native) with `class-variance-authority`
- Dark/light mode via CSS class strategy, persisted in AsyncStorage
- Custom color palette defined as HSL variables in `global.css` and `tailwind.config.js`
- UI primitives in `components/ui/` built on `@rn-primitives/*`

### Path Aliases

- `@/*` and `~/*` both resolve to the project root

## Best Practices

### Language

All UI text must be in **Norwegian**. This includes button labels, headings, error messages, toasts, and placeholders. Date formatting uses `"no-NO"` locale.

### API Calls

- Place in `actions/[feature]/` with proper subfolder organization
- **Authenticated calls go through `apiJson`/`apiFetch` in `lib/api/client.ts`** — never build the headers by hand. The helpers attach the OAuth access token as `Authorization: Bearer …`, and on a token rejection they refresh the session once and retry; if the fresh token is rejected too they emit a session-lost event and throw `UnauthorizedError`, which sends the user to the login screen.
- Paths passed to `apiJson`/`apiFetch` are relative to `API_URL` (e.g. `/event/${id}/registration`); an absolute `http…` URL is passed through unchanged
- `apiJson<T>` already checks `response.ok` and throws — Photon's error handler answers `{ message }`, and a non-JSON body falls back to `Forespørselen feilet (<status>)`
- Actions return the mapped domain type directly and throw on failure; they do not wrap results in a response object
- Open endpoints (events, job posts) use a plain `fetch()` against `API_URL` so they work without a token, but still map through `actions/photon.ts`

```typescript
import { apiJson } from "@/lib/api/client";
import { PhotonGroup, toMembership } from "@/actions/photon";

// Authenticated: apiJson attaches the bearer token, refreshes on rejection,
// and throws with Photons { message } when the response is not ok.
const groups = await apiJson<PhotonGroup[]>("/groups/mine");
return groups.map(toMembership);
```

### React Query

- Query keys as simple arrays: `["events"]`, `["permissions"]`, `["jobposts"]`
- Use `useInfiniteQuery` with `initialPageParam` and `getNextPageParam` for paginated lists
- Use the custom `useRefresh()` hook to wire pull-to-refresh with query invalidation
- Mutation error feedback via `Toast.show({ type: "error", text1, text2 })`

### Components

- All UI components use `React.forwardRef` with typed refs and set `displayName`
- Pass `className` through `cn()` utility (from `lib/utils.ts`) for Tailwind class merging
- Use CVA (`class-variance-authority`) for component variants (see `components/ui/button.tsx`)
- Create skeleton loading components (e.g., `EventCardSkeleton`) with `animate-pulse` for pending states
- Feature-specific components in `components/[feature]/`, reusable UI in `components/ui/`

### Styling Rules

- Use platform prefixes for platform-specific styles: `web:`, `native:`, `ios:`, `android:`
- **Never use bare `transition` or `duration` classes on native components** — always prefix with `web:` (e.g., `web:transition web:duration-200`). These trigger Reanimated animations on native and cause errors with function components.
- Colors reference CSS variables: `bg-primary`, `text-foreground`, `border-input`, etc.
- Dark mode via `dark:` prefix: `dark:bg-background dark:text-foreground`

### Auth Flow

- Auth state managed in `context/auth.tsx` with `useAuth()` hook
- Layout files check `authState` to redirect: unauthenticated → `/login`, authenticated → `/arrangementer`
- Token stored in `expo-secure-store`, loaded on mount

### Navigation

- New screens go in the appropriate route group: `(tabs)/` for tab screens, `(modals)/` for modal screens
- Modal screens use the shared `modalScreenOptions` constant
- Tab navigation uses `expo-router/ui` components: `Tabs`, `TabList`, `TabTrigger`, `TabSlot`

### Icons

- Use `lucide-react-native` for icons
- Icon registry in `lib/icons/Icon.ts`

### Custom Hooks

- `useRefresh()` — pull-to-refresh with query invalidation
- `useColorScheme()` — extends NativeWind color scheme with persistent storage
- `usePermissions()` — fetches and caches user permissions
