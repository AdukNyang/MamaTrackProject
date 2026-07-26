# MamaTrack

A mobile app for community health workers and supervisors to track antenatal patients, visits, risk flags, and SMS outreach.

Built with Expo (React Native) and a NestJS API backed by Postgres.

## What you need

- Node.js 18+
- npm
- A Postgres database (we use [Neon](https://neon.tech))
- For mobile testing: [Expo Go](https://expo.dev/go), or Android Studio / Xcode for emulators

## Setup

1. Clone the repo and install dependencies:

```bash
npm install
npm install --prefix server
```

2. Copy the env file and fill in your values:

```bash
cp .env.local.example .env.local
```

You'll need at least:

- `DATABASE_URL` — your Postgres connection string
- `JWT_SECRET` — run `openssl rand -hex 32` to generate one
- `EXPO_PUBLIC_API_URL` — where the app finds the API (see below)
- SMTP settings if you want login verification emails to work

For a phone on the same Wi‑Fi, set `EXPO_PUBLIC_API_URL` to your computer's IP, e.g. `http://192.168.1.10:3000/api`. For web or a simulator, `http://localhost:3000/api` is fine.

3. Set up the database:

```bash
npm run db:migrate
npm run db:seed:all
```

This creates a supervisor account you can sign in with:

| | |
|---|---|
| Email | `sam.dv.350@gmail.com` |
| Password | `admin123` |

After login, check the email inbox for the 8-digit verification code.

## Run the app

You need two terminals.

**Terminal 1 — API server**

```bash
npm run server:dev
```

**Terminal 2 — Expo app**

```bash
npm start
```

Then open the app on web (`w`), Android (`a`), iOS (`i`), or scan the QR code with Expo Go.

## Useful commands

| Command | What it does |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run server:dev` | Start the API in watch mode |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed:all` | Seed supervisor + demo data |
| `npm run lint` | Run ESLint |

## Project layout

```
src/app/       Expo Router screens
src/components Shared UI
server/        NestJS API
```
