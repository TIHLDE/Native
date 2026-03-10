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

## Building and Submitting to App Stores

We use [EAS Build](https://docs.expo.dev/build/introduction/) and [EAS Submit](https://docs.expo.dev/submit/introduction/) to create production builds and publish to the App Store and Google Play.

### Prerequisites

Install EAS CLI globally:

```bash
npm install -g eas-cli
```

Log in to the TIHLDE Expo account:

```bash
eas login
```

### Build Profiles

The project has three build profiles configured in `eas.json`:

| Profile | Purpose | Distribution |
|---------|---------|-------------|
| `development` | Dev client for local testing | Internal |
| `preview` | Internal testing builds | Internal |
| `production` | App Store / Google Play releases | Store |

### Creating Production Builds

Build for both platforms:

```bash
eas build --platform all --profile production
```

Or build for a single platform:

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

The production profile auto-increments the build number on each build.

### Submitting to App Stores

#### iOS (App Store)

```bash
eas submit --platform ios --profile production
```

This will prompt you to select a build and submit it to App Store Connect. You can then manage the release from [App Store Connect](https://appstoreconnect.apple.com/).

#### Android (Google Play)

```bash
eas submit --platform android --profile production
```

This uses the service account key (`service-account-file.json`) configured in `eas.json` and submits directly to the production track on Google Play Console.

### Full Release Workflow

1. Bump the version in `app.json` and `package.json` if needed
2. Build: `eas build --platform all --profile production`
3. Submit: `eas submit --platform ios` and `eas submit --platform android`
4. iOS: Go to App Store Connect to add release notes and submit for review
5. Android: Release goes live automatically (production track)

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
