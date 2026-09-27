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

## Accessible peer mentoring

In **Peer Mentoring**, request academic help and choose **Create an adapted learning plan with my mentor**. Select helpful learning preferences, a goal, response method, session length and flexible breaks. Choose a supported conversation/demonstration or an untimed quiz. Plans accommodate learner-selected needs, including neurodegenerative conditions and intellectual or developmental disabilities; a diagnosis is not requested or used to infer ability.

Choose **Online** with an optional school-approved HTTPS meeting link, or **Offline** with an optional campus location. CampusLoop records this arrangement; it does not create conference rooms. Confirm the meeting details with the mentor if left blank.

Switch to the assigned mentor (Rohan in the demo), accept the request, then create, edit and share the three-lesson curriculum draft. The learner can agree or ask for a change. Dr. Ananya can optionally review it from the **Mentoring Sessions** tab in **Admin Audit** or the mentoring page. Editing a plan clears previous review and agreement; a plan must be shared and agreed before an adapted session can be marked finished.

Supported sessions finish with a learner participation confirmation and reflection. Practising, maintaining a skill and needing more support receive the same participation credit; no fabricated quiz scores are shown. A full demo reset clears the plans, preferences and session activity too.

See [the teaching sources and design notes](docs/accessible-mentoring.md) for EEF (UK) and CAST (US) guidance. Drafts require mentor/learner adaptation and teacher guidance; they are educational support, not medical treatment or formal individualized education plans. Use fictional preferences in this shared demo.

## Demo boundaries

Persona switching and campus state are stored in browser local storage. This repository does not implement Firebase authentication, a server-backed campus database, or real payments. Role checks protect the demo workflows; they are not a production security boundary. State updates are coordinated within one running provider, not across independent tabs or devices.

The AI endpoint treats all browser-supplied context as untrusted demo data and limits requests by the connecting IP address. Shared networks/proxies share that limit. Production use needs authenticated sessions, server-side authorization and data persistence, plus a deployment-specific trusted-proxy and distributed rate-limit configuration.
