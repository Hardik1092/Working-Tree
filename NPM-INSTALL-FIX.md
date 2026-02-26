# Fix npm install: 403 Forbidden + EPERM on Windows

## 1. Fix EPERM (locked files)

Windows locks `node_modules` when something is using them. Do this **before** every clean install:

- **Stop Expo/Metro:** In any terminal running `npx expo start`, press `Ctrl+C`.
- **Close all terminals** that were in `Working-Tree` or `krishiconnect-mobile`.
- **Optional:** Close VS Code/Cursor, then reopen the project (so no process holds locks).
- Run the install from a **new** PowerShell window.

## 2. Clean install (PowerShell)

Use these commands in **PowerShell** (not CMD). Run from repo root:

```powershell
cd C:\Users\ASUS\Desktop\JayPra\Working-Tree

# Remove node_modules (PowerShell syntax)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force krishiconnect-mobile\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force shared\node_modules -ErrorAction SilentlyContinue

# Remove lockfile so overrides apply (optional; only if you want a full clean install)
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Clear npm cache (helps with 403 in some cases)
npm cache clean --force

# Install
npm install
```

If `Remove-Item` still says "operation not permitted", close **every** app that might use the repo (Cursor, terminals, Expo Go on phone), then try again. As a last resort, restart the PC and run the same commands.

## 3. Fix 403 Forbidden

403 means the registry (or your network) is blocking the request.

**A. Try again later**  
Registry or network can be temporarily blocking. Wait 10–15 minutes and run `npm install` again.

**B. Use an npm mirror**  
Edit the project `.npmrc` and **uncomment** one of the `registry=` lines (e.g. `registry=https://registry.npmmirror.com`), then run `npm install`. Comment it out again if you want to switch back to the default registry.

**C. Check proxy / VPN**  
If you use corporate proxy or VPN, try without VPN or set npm proxy:

```powershell
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
```

**D. Auth / scope**  
If you use a private registry or scoped packages, make sure you’re logged in:

```powershell
npm whoami
npm login
```

## 4. If you already have a working `package-lock.json`

If installs worked before and you have a lockfile from another machine or backup:

- **Do not delete** `package-lock.json`.
- Only run:  
  `Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue`  
  (and same for `krishiconnect-mobile\node_modules`, `shared\node_modules` if you use workspaces).
- Then run `npm install`.

That uses the locked versions and can avoid fetching packages that currently return 403.
