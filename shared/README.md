# @krishiconnect/shared

Shared types, API client, and utilities for KrishiConnect mobile (and optionally web).

## Build

```bash
npm install
npm run build
```

Output: `dist/` (JS + `.d.ts`).

## Usage

- **Types**: `User`, `Post`, `FeedPost`, `ApiResponse<T>`, `LoginPayload`, etc.
- **API client**: `createApiClient({ baseURL, getToken, onUnauthorized })`, `request(method, path, data?, opts?)`.
- **Endpoints**: `AUTH`, `USERS`, `POSTS` path constants.
- **Validators**: Zod schemas `loginSchema`, `registerSchema`, etc.
- **Formatters**: `formatRelativeTime`, `formatDate`, `truncate`.

No React or React Native; safe to use from Node or any bundler.
