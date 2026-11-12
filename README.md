# TIHLDE Native

Mobile app for TIHLDE built with React Native, Expo, and TypeScript. Supports iOS and Android.

Members can browse and register for events, view career postings, check in via QR codes, see their groups, give and view fines, and submit expenses.

## Tech Stack

- **Framework:** React Native + Expo
- **Routing:** Expo Router (file-based)
- **Styling:** NativeWind (TailwindCSS for React Native)
- **State:** React Query for server state, React Context for auth
- **Language:** TypeScript

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.4.2 or newer
- [Node.js](https://nodejs.org/) 22.13+, 24.3+ or 26+ (`.nvmrc` pins 24)
- **iOS** (macOS only): Xcode
- **Android**: Android Studio with an emulator, JDK 17 or 21, and `ANDROID_HOME` and `JAVA_HOME` set
- **Android on Windows**: CMake 3.31.6 from the SDK Manager and long paths enabled (`LongPathsEnabled` in the registry)

### Installation

```bash
bun install
```

### Running the App

Start the dev server and open the app in [Expo Go](https://expo.dev/go) by scanning the QR code, or press `i` for the iOS simulator or `a` for the Android emulator:

```bash
bun x expo start
```

`expo-dev-client` is installed, so the server targets a development build by default. Press `s` in the terminal to switch to Expo Go.

Expo Go redirects OAuth through `exp://` instead of `tihlde://`, so the default client does not work there. Create your own public client in Kvark with redirect URI `exp://<host>/--/oauth/callback` (`<host>` is the address Expo prints at startup) and set `EXPO_PUBLIC_PHOTON_CLIENT_ID` (see [Local Photon](#local-photon)).

#### Development build

Build and install a development build when you need something Expo Go doesn't include, such as push notifications on Android, or the default OAuth client. Rebuild after adding a package with native code, changing `app.json`, or upgrading the Expo SDK:

```bash
bun run ios            # Build and run on iOS simulator
bun run android        # Build and run on Android emulator
```

Both also start the dev server.

### Commands

```bash
bun run test           # Jest in watch mode (not `bun test`, which runs Bun's own runner)
bun run lint           # ESLint via Expo
```

## Local Photon

The app uses production Photon by default. To use a local Photon instead:

1. Run Photon and Kvark locally, as described in the [Photon README](https://github.com/TIHLDE/Photon#readme). Photon runs on `localhost:4000` and Kvark on `localhost:3000`.
2. In Kvark (Admin → OAuth-klienter), create a client with redirect URI `tihlde://oauth/callback` and "Offentlig klient" checked.
3. Copy `.env.example` to `.env`, uncomment `EXPO_PUBLIC_PHOTON_URL` and `EXPO_PUBLIC_PHOTON_CLIENT_ID`, set the client id, and restart with `bun x expo start --clear`.

**Android emulator:** `localhost` points at the emulator itself, so forward the ports after each emulator start:

```bash
adb reverse tcp:4000 tcp:4000 && adb reverse tcp:3000 tcp:3000
```

`adb reverse` can't reach Vite's default IPv6 address, so start Kvark with `--host 127.0.0.1`. Photon and Kvark have to be started separately for this, not through the combined dev command.

## Building and Submitting

Production builds and store submissions use [EAS Build](https://docs.expo.dev/build/introduction/) and [EAS Submit](https://docs.expo.dev/submit/introduction/).

```bash
bun install -g eas-cli
eas login              # Log in to the TIHLDE Expo account
```

### Build Profiles

Defined in `eas.json`:

| Profile | Purpose | Distribution |
|---------|---------|--------------|
| `development` | Development client for local testing | Internal |
| `preview` | Release-mode build (no development client) for internal testing outside the stores | Internal |
| `production` | App Store and Google Play releases. The build number is incremented automatically. | Store |

### Release Workflow

1. Bump `version` in `app.json`.
2. Build: `eas build --platform all --profile production` (or `--platform ios` / `--platform android`).
3. Submit: `eas submit --platform ios` and `eas submit --platform android`. Add `--auto-submit` to the build command to submit when the builds finish.
4. Test the builds in TestFlight and the Google Play internal testing track.
5. iOS: add release notes in [App Store Connect](https://appstoreconnect.apple.com/) and submit for review.
6. Android: promote the internal testing release to production in Play Console.

### Credentials

Signing keys, the Google Play service account key (used by `eas submit`) and the FCM V1 key (push notifications) are stored in EAS under the TIHLDE account, so being logged in with `eas login` is enough. Manage them with `eas credentials`.

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