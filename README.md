# TIHLDE Native

Mobile app for TIHLDE built with React Native, Expo, and TypeScript. Supports iOS and Android.

The app lets members browse and register for events, view career postings, check in via QR codes, see their groups, give and view fines, and submit expenses.

## Tech Stack

- **Framework:** React Native + Expo (SDK 57)
- **Routing:** Expo Router (file-based)
- **Styling:** NativeWind (TailwindCSS for React Native)
- **State:** React Query for server state, React Context for auth
- **Language:** TypeScript

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.4.2 or newer
- [Node.js](https://nodejs.org/) 20.19.4+, 22.13+ or 24.3+ (`.nvmrc` pins 24)
- **iOS** (macOS only): Xcode, selected with `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`. Keep the repo out of iCloud-synced folders, or code signing fails.
- **Android**: Android Studio with an emulator, JDK 17 or 21, and `ANDROID_HOME` and `JAVA_HOME` set

Expo CLI comes with the project, and `bun run ios` tries to install CocoaPods if it's missing.

### Installation

```bash
bun install
```

### Building the Development App

The app uses native code, so it does not run in Expo Go. Build and install the development app on the simulator or emulator the first time, and again after adding a package with native code, changing `app.json`, or upgrading the Expo SDK:

```bash
bun run ios            # Build and run on iOS simulator (the first build is slow)
bun run android        # Build and run on Android emulator
```

Both also start the dev server, so you can start working right away.

If an iOS build fails with error 65, the real error is in `.expo/xcodebuild.log`.

### Development

When the development app is already installed, start only the dev server instead of rebuilding:

```bash
bun x expo start       # Start the Expo dev server
```

From the dev server, press `i` for the iOS simulator or `a` for the Android emulator. Changes appear when you save.

### Local Photon

The app uses production Photon by default. To use a local Photon instead:

1. Start Photon with `bun dev` in the Photon repo.
   For the Android emulator, run `bun dev --filter=@photon/api` instead, start Kvark separately with `bun run dev --host 127.0.0.1` in `Photon/apps/kvark` (`adb reverse` can't reach Vite's default IPv6 address), and run `adb reverse tcp:4000 tcp:4000 && adb reverse tcp:3000 tcp:3000` after each emulator start.
2. In Kvark (`localhost:3000`, Admin → OAuth-klienter), create a client with redirect URI `tihlde://oauth` and "Offentlig klient" checked.
3. Copy `.env.example` to `.env.local`, uncomment both lines, set the client id, and restart with `bun x expo start --clear`.

### Testing

```bash
bun run test           # Run tests in watch mode (`bun test` would run Bun's own runner, not Jest)
```

### Linting

```bash
bun run lint           # Run ESLint via Expo
```

## Building and Submitting to App Stores

We use [EAS Build](https://docs.expo.dev/build/introduction/) and [EAS Submit](https://docs.expo.dev/submit/introduction/) to create production builds and publish to the App Store and Google Play.

### Prerequisites

Install EAS CLI globally:

```bash
bun install -g eas-cli
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
│   ├── (tabs)/        # Bottom tabs: arrangementer, karriere, bot, grupper, profil
│   └── (modals)/      # Slide-from-right screens: event details, group page,
│                      #   give-a-fine flow, expenses, notifications, QR
actions/               # API calls and TypeScript types
components/            # UI and feature-specific components
context/               # React Context providers (auth)
lib/                   # Hooks, utilities, and storage helpers
```
