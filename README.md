# MamaTrack

MamaTrack is a mobile app for community health workers and supervisors to manage antenatal patients, visits, risk flags, and SMS outreach. The frontend is built with [Expo](https://expo.dev) (React Native) and the backend runs on [Convex](https://convex.dev) with password + email OTP authentication.

## Quick start (shared backend)

Use this path if someone on the project gave you a `.env.local` file. **You do not need a Convex account.**

### Prerequisites

- **Node.js** 18 or later
- **npm**
- For mobile: [Expo Go](https://expo.dev/go) on a device, or Android Studio / Xcode for emulators

### Setup

1. Clone or download this repo.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Place the `.env.local` file you were given in the project root (same folder as `package.json`).

   Do **not** commit this file — it contains connection details for the shared backend.

4. Start the app:

   ```bash
   npm start
   ```

5. Open the app:
   - **Web:** press `w` or run `npm run web`
   - **Android:** press `a` or run `npm run android`
   - **iOS:** press `i` or run `npm run ios` (macOS only)
   - **Physical device:** scan the QR code with Expo Go

That is all you need. The app talks to the shared Convex deployment over the internet — no local backend setup required.

### Signing in

Ask the project owner for the test login email and password. After you enter them, an 8-digit OTP is sent to that email address — you need access to that inbox (or the owner can forward the code) to finish signing in.

---

## Maintainer setup (Convex project owner)

Use this path only if you are setting up or maintaining the shared backend. Everyone else can skip this section.

### Prerequisites

- Everything in the quick start, plus:
- A [Convex](https://www.convex.dev/) account
- SMTP credentials for login OTP emails (Gmail app password, Mailtrap, etc.)

### 1. Install dependencies

```bash
npm install
```

### 2. Create the Convex deployment

```bash
npm run convex:dev
```

Log in to Convex when prompted and create or link a project. Leave this running while you work on backend changes.

### 3. Create `.env.local`

Copy the example file and fill in values from the `convex dev` output:

```bash
cp .env.local.example .env.local
```

Set at minimum:

- `CONVEX_DEPLOYMENT`
- `EXPO_PUBLIC_CONVEX_URL`
- `EXPO_PUBLIC_CONVEX_SITE_URL`
- `SITE_URL`

Add your SMTP settings in the same file (see `.env.local.example`).

### 4. One-time backend configuration

```bash
# JWT keys for Convex Auth
npm run convex:auth:keys

# Push SMTP + SITE_URL to Convex
npm run convex:env:sync
```

### 5. Seed the database

```bash
# Supervisor account only
npm run convex:seed

# Demo patients, visits, risk flags, etc.
npm run convex:seed:demo

# Or both at once
npm run convex:seed:all
```

Default seeded supervisor credentials:

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `sam.dv.350@gmail.com` |
| Password | `admin123`             |

### 6. Share access with others

Send collaborators a copy of `.env.local` through a private channel (email, Slack DM, password manager, etc.). **Do not commit it to git.**

Also share:

- The test login email and password
- How to reach the OTP inbox (or agree to forward codes during demos)

Collaborators then follow [Quick start](#quick-start-shared-backend) above.

### Running locally as maintainer

When changing backend code, use two terminals:

**Terminal 1 — Convex**

```bash
npm run convex:dev
```

**Terminal 2 — Expo**

```bash
npm start
```

If you are only working on the frontend and the backend is already deployed, you can run `npm start` alone.

## Available scripts

| Command | Description |
| ------- | ----------- |
| `npm start` | Start the Expo dev server |
| `npm run web` | Start Expo for web |
| `npm run android` | Start Expo for Android |
| `npm run ios` | Start Expo for iOS |
| `npm run convex:dev` | Run Convex in dev mode (maintainers only) |
| `npm run convex:deploy` | Deploy Convex functions to production |
| `npm run convex:env:sync` | Push SMTP and site URL from `.env.local` to Convex |
| `npm run convex:auth:keys` | Generate and set JWT keys for Convex Auth |
| `npm run convex:seed` | Create the default supervisor account |
| `npm run convex:seed:demo` | Seed demo clinic data |
| `npm run convex:seed:all` | Seed supervisor + demo data |
| `npm run lint` | Run ESLint |

## Project structure

```
mama-track/
├── src/app/          # Expo Router screens and navigation
├── src/components/   # Shared UI components
├── src/lib/          # Client helpers (Convex, auth, storage)
├── convex/           # Backend schema, queries, mutations, auth
├── assets/           # Images and icons
└── scripts/          # Convex setup helpers
```

## Troubleshooting

**`Missing EXPO_PUBLIC_CONVEX_URL`**

Make sure `.env.local` is in the project root and contains `EXPO_PUBLIC_CONVEX_URL`. Restart the Expo dev server after adding or changing env vars.

**Login fails after entering password**

The shared backend must have SMTP configured (maintainer runs `npm run convex:env:sync`). Confirm you are using the test account credentials from the project owner and can receive the OTP email.

**App loads but data looks empty**

Ask the maintainer to run `npm run convex:seed:all` on the shared deployment.

**Backend changes not showing up (maintainers)**

Run `npm run convex:dev` so function changes sync to the deployment.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Convex documentation](https://docs.convex.dev/)
- [Convex Auth](https://labs.convex.dev/auth)
