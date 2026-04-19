# CLAUDE.md — Kliques Mobile App

## What This Is

This is a React Native (Expo) mobile app that wraps the Kliques web app (`https://app.mykliques.com`) in a WebView with a native bottom tab bar. The web app handles ALL business logic, UI, and API calls. This project is a thin native shell — nothing more.

The web app repo is separate. This repo does NOT contain any business logic, React components, API routes, or database queries. If you need to change how a page looks or works, that happens in the web repo, not here.

## Architecture

```
User opens app → Auth check (SecureStore) → Login WebView OR Tab Bar
Tab Bar → Each tab loads a different web app route in a WebView
WebView ↔ Native communication via JS bridge (postMessage)
```

- **WebView loads:** `https://app.mykliques.com{path}?native=1`
- **The `?native=1` param** tells the web app to hide its sidebar/hamburger nav since the native tab bar handles navigation
- **JS Bridge:** Web sends messages via `window.ReactNativeWebView.postMessage()`, native listens via `onMessage` prop. Native injects `window.KliquesNative` object into the web context.

## Tech Stack

- **Framework:** React Native via Expo SDK (Expo Router for navigation)
- **Navigation:** Expo Router with bottom tab layout (`app/(tabs)/`)
- **Core package:** `react-native-webview` — this IS the app
- **Auth storage:** `expo-secure-store` — stores JWT token + user role
- **Push notifications:** `expo-notifications` — Expo push service
- **Deep linking:** Universal Links (iOS) + App Links (Android) for `/join/*` and `/book/*` URLs

## File Structure

```
app/
  _layout.js              # Root layout — auth check, splash screen, SafeAreaProvider
  login.js                # Full-screen WebView for /login (no tab bar)
  (tabs)/
    _layout.js            # Bottom tab bar — reads role from SecureStore, renders correct tabs
    home.js               # Provider only: /provider
    bookings.js           # Provider: /provider/appointments | Client: /app/bookings
    mykliques.js          # Provider: /provider/clients | Client: /app
    services.js           # Provider only: /provider/services
    messages.js           # Client only: /app/messages
    notifications.js      # Client only: /app/notifications
    more.js               # Provider: /provider/more | Client: /app/more

components/
  KliquesWebView.js       # THE core component. Every screen uses this.
  TabIcon.js              # SVG icons for tab bar

services/
  notifications.js        # Push token registration + notification handling
  auth.js                 # SecureStore read/write for token + role
  bridge.js               # JS bridge message type definitions + handlers

constants/
  config.js               # BASE_URL, COLORS, PROVIDER_TABS, CLIENT_TABS
```

## Key Conventions

### WebView is the source of truth
Every tab screen is just `<KliquesWebView path="/some/route" />`. Never rebuild web app functionality in React Native. If a feature exists in the web app, load it in the WebView.

### Two user roles, two tab configs
- **Provider tabs:** Home, Bookings, My Kliques, Services, More
- **Client tabs:** My Kliques, Messages, Bookings, Notifications, More
- Role is stored in SecureStore under key `kliques_role` (value: `'provider'` or `'client'`)
- Tab layout reads role on mount and renders the correct set
- Some tabs are role-specific (home.js and services.js are provider-only; messages.js and notifications.js are client-only)
- Shared tabs (bookings.js, mykliques.js, more.js) read the role to determine which path to load

### JS Bridge message types (Web → Native)
```
AUTH_TOKEN        { token: string, role: 'provider' | 'client' }
LOGOUT            {}
NOTIFICATION_COUNT { messages: number, notifications: number }
HAPTIC            { style: 'light' | 'medium' | 'heavy' }
SHARE             { url: string, title: string }
REQUEST_NOTIFICATION_PERMISSION {}
```

### JS Bridge injected object (Native → Web)
The WebView injects `window.KliquesNative` into every page:
```js
window.KliquesNative = {
  isNative: true,
  postMessage: function(type, payload) { ... },
  haptic: function(style) { ... },
  share: function(url, title) { ... },
  requestNotificationPermission: function() { ... }
};
```
The web app checks `window.KliquesNative?.isNative` to know if it's running inside the native shell.

### SecureStore keys
- `kliques_token` — JWT access token from Supabase auth
- `kliques_role` — `'provider'` or `'client'`
- `kliques_push_token` — Expo push token (to avoid re-registering)

### Navigation rules
- Login screen: full-screen WebView, NO tab bar
- Authenticated screens: WebView + bottom tab bar
- "More" tab: loads `/provider/more` or `/app/more` (a menu page on the web app)
- Deep links (`/join/*`, `/book/*`): load in the active WebView if authenticated, otherwise go to login first then redirect

## Design Tokens

Match the web app's v6 design system:
```
Base:       #FBF7F2 (cream background — used for splash screen)
Ink:        #3D231E (primary text)
Accent:     #C25E4A (terracotta — active tab color)
Faded:      #B0948F (inactive tab color)
Tab bar:    #FFFFFF background, rgba(140,106,100,0.12) top border
Status bar: dark-content (dark icons on light background)
```

## What NOT To Do

- **Never rebuild a web page in React Native.** If it exists at app.mykliques.com, load it in the WebView.
- **Never call the Express API directly from this app.** The WebView's web app handles all API calls. The only direct API call this app makes is `POST /api/users/:id/push-token` for push notification registration.
- **Never store sensitive data in AsyncStorage.** Use SecureStore for tokens.
- **Never show the web app's sidebar/hamburger.** The `?native=1` param ensures the web app hides it.
- **Don't install heavy UI libraries.** This app has almost no native UI — just the tab bar and a loading spinner. No need for NativeBase, React Native Paper, etc.
- **Don't install an icon library.** Tab icons are simple SVG paths in the TabIcon component.

## Backend Integration

The web app's Express backend is at `https://proxeybooking-app.onrender.com`. This mobile app only calls one endpoint directly:

```
POST /api/users/:userId/push-token
Body: { token: string, platform: 'ios' | 'android' }
Table: push_tokens (user_id, token, platform, created_at)
```

Push notifications are sent from the backend via Expo's push API:
```
POST https://exp.host/--/api/v2/push/send
Body: { to: pushToken, title, body, data, sound: 'default' }
```

## Build & Deploy

```bash
# Development
npx expo start                    # Start dev server, scan QR with Expo Go

# Build for stores
npx eas build --platform ios      # iOS build (requires Apple Developer account)
npx eas build --platform android  # Android build

# Submit to stores
npx eas submit --platform ios
npx eas submit --platform android
```

## Bundle IDs
- iOS: `com.kliques.app`
- Android: `com.kliques.app`

## Deep Link Domains
- `mykliques.com/join/*` — invite acceptance
- `mykliques.com/book/*` — public booking
- `app.mykliques.com/join/*` — same
- `app.mykliques.com/book/*` — same
- Custom scheme: `kliques://`