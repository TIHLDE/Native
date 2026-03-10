# TIHLDE Native

Mobile app for TIHLDE built with React Native, Expo, and TypeScript. Supports iOS and Android.

The app lets members browse events, register for events, view career postings, and check in via QR codes.

## Tech Stack

- **Framework:** React Native + Expo (SDK 52)
- **Routing:** Expo Router (file-based)
- **Styling:** NativeWind (TailwindCSS for React Native)
- **State:** React Query for server state, React Context for auth
- **Language:** TypeScript

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
npm install
```

### Development

```bash
npx expo start        # Start the Expo dev server
```

From the dev server, press `i` for iOS simulator or `a` for Android emulator.

### Run on Device/Simulator Directly

```bash
npm run ios            # Build and run on iOS simulator
npm run android        # Build and run on Android emulator
npm run web            # Start for web
```

### Testing

```bash
npm test               # Run tests in watch mode
```

### Linting

```bash
npm run lint           # Run ESLint via Expo
```

## Project Structure

```
app/                   # Expo Router file-based routes
├── (auth)/            # Login screen
├── (app)/
│   ├── (tabs)/        # Bottom tab navigator (events, career)
│   ├── profil/        # User profile
│   └── (modals)/      # Modal screens (slide-from-right)
actions/               # API calls and TypeScript types
components/            # UI and feature-specific components
context/               # React Context providers (auth)
lib/                   # Hooks, utilities, and storage helpers
```
