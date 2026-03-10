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
    ├── (tabs)/              # Bottom tab navigator (expo-router/ui Tabs)
    │   ├── arrangementer/   # Events (infinite scroll list + details)
    │   └── karriere/        # Job postings
    ├── profil/              # User profile
    └── (modals)/            # Slide-from-right modal screens (route group)
```

Modals use `router.push("/(modals)/...")` with `presentation: "card"` and `animation: "slide_from_right"`. Dynamic params via `useLocalSearchParams()`.

### Data Layer

- **API calls** live in `actions/` with direct `fetch()` calls against `https://api.tihlde.org` (configurable in `actions/constant.ts`)
- **Types** in `actions/types/` with barrel export from `index.ts` (Event, User, Registration, LoginData, etc.)
- **Server state** via `@tanstack/react-query` (infinite queries for lists, standard queries for details)
- **Auth state** via React Context (`context/auth.tsx`) with token in `expo-secure-store`

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
- Auth token via `X-Csrf-Token` header, retrieved from `getToken()` in `lib/storage/tokenStore.ts`
- Check `response.ok` before parsing; cast errors to `LeptonError` type for the `detail` message
- Return typed responses using `ActionResponse<T>` wrapper (`{ data?, status, error? }`)

```typescript
const token = await getToken();
const response = await fetch(`${BASE_URL}/endpoint/`, {
    method: "GET",
    headers: { "X-Csrf-Token": token },
});
if (!response.ok) {
    const errorData = await response.json() as LeptonError;
    throw new Error(errorData.detail);
}
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
