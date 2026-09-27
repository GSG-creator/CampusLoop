# CampusLoop

React, Vite and Express demo for campus book sharing, peer mentoring, credits and rewards.

## Run locally

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Set `PORT` to use another port.

The app starts without AI credentials. To enable live Gemini replies, copy `.env.example` to `.env` and set `GEMINI_API_KEY`. `GEMINI_MODEL` can override the default model. Credentials stay on the server. Without a configured key, the assistant labels its local lookup results and offline status explicitly.

## Verify changes

```sh
npm run lint
npm test
npm run build
```

`lint` runs the TypeScript check. `test` runs both the original scenario scripts and regression tests that exercise the real React provider, UI components, AI service and HTTP API. Every suite exits unsuccessfully when assertions fail. AI API tests inject a fake provider and need no credentials or paid calls.

`package-lock.json` pins the dependency tree. Keep it updated with any dependency changes; a normal install should not need `--force` or `--legacy-peer-deps`.

## Serve the built app

After `npm run build`, set `NODE_ENV=production` in the shell or hosting environment and run `npm start`. The Express server serves both the built site and `/api/loop-ai`. `npm run preview` previews only the static frontend and does not run the API.

## Demo boundaries

Persona switching and campus state are stored in browser local storage. This repository does not implement Firebase authentication, a server-backed campus database, or real payments. Role checks protect the demo workflows; they are not a production security boundary. State updates are coordinated within one running provider, not across independent tabs or devices.

The AI endpoint treats all browser-supplied context as untrusted demo data and limits requests by the connecting IP address. Shared networks/proxies share that limit. Production use needs authenticated sessions, server-side authorization and data persistence, plus a deployment-specific trusted-proxy and distributed rate-limit configuration.
