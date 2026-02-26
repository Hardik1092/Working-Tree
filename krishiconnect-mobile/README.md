# KrishiConnect Mobile

Expo React Native app. Uses the same backend as the web app.

## Setup

1. From repo root, install workspace dependencies:
   ```bash
   npm install
   ```
2. Build the shared package:
   ```bash
   cd shared && npm run build && cd ..
   ```
3. Add app assets (required by app.json): copy `icon.png`, `splash-icon.png`, `adaptive-icon.png`, and `favicon.png` into `src/assets/` (e.g. from a new Expo app: `npx create-expo-app@latest _tmp --template tabs` then copy `_tmp/assets/*` to `src/assets/`).
4. Create `.env` or set `EXPO_PUBLIC_API_URL` (default: `http://localhost:5005/api/v1`).
   - **Physical device (Expo Go):** Set `EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:5005/api/v1` (e.g. `http://192.168.1.10:5005/api/v1`) so the device can reach the backend.
   - **Web:** Backend CORS allows `http://localhost:8081` in development when `CLIENT_URL` is unset; or set backend `CLIENT_URL=http://localhost:5173,http://localhost:8081`.
5. Start the backend (port 5005), then:
   ```bash
   cd krishiconnect-mobile && npx expo start
   ```

## Structure

- `app/` — Expo Router screens (auth, tabs).
- `src/features/` — Auth, home feed, profile (business logic + UI).
- `src/services/` — API calls using `@krishiconnect/shared`.
- `src/store/` — Zustand auth store (persisted with SecureStore).
- `src/components/` — Reusable UI and common components.
