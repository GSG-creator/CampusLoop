# CampusLoop

React, Vite and Express demo for campus book sharing, peer mentoring, credits, rewards and accessibility support.

## Run locally

Use Node.js 24 LTS.

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

Run `npm run build`, then `npm start`. The build produces the frontend in `dist/` and a compiled `server.js`; the start command selects production mode automatically. The Express server serves both the built site and `/api/loop-ai`, and listens on `0.0.0.0` using the hosting environment's `PORT`. `npm run preview` previews only the static frontend and does not run the API.

## Deploy from Google AI Studio

Import **GSG-creator/CampusLoop**, branch **main**, into AI Studio Build mode, or pull the latest changes through **Settings → GitHub** if the app is already connected. Confirm `GEMINI_API_KEY` in AI Studio's server-side Secrets panel for live AI, then use **Publish**. The demo also runs without a key.

See [the Google AI Studio deployment guide](docs/google-ai-studio.md) for the exact build/start settings, verification steps and Cloud Run container option.

## Accessible peer mentoring

In **Peer Mentoring**, request academic help and choose **Create an adapted learning plan with my mentor**. Select helpful learning preferences, a goal, response method, session length and flexible breaks. Choose a supported conversation/demonstration or an untimed quiz. Plans accommodate learner-selected needs, including neurodegenerative conditions and intellectual or developmental disabilities; a diagnosis is not requested or used to infer ability.

Choose **Online** with an optional school-approved HTTPS meeting link, or **Offline** with an optional campus location. CampusLoop records this arrangement; it does not create conference rooms. Confirm the meeting details with the mentor if left blank.

Switch to the assigned mentor (Rohan in the demo), accept the request, then create, edit and share the three-lesson curriculum draft. The learner can agree or ask for a change. Dr. Ananya can optionally review it from the **Mentoring Sessions** tab in **Admin Audit** or the mentoring page. Editing a plan clears previous review and agreement; a plan must be shared and agreed before an adapted session can be marked finished.

Supported sessions finish with a learner participation confirmation and reflection. Practising, maintaining a skill and needing more support receive the same participation credit; no fabricated quiz scores are shown. A full demo reset clears the plans, preferences and session activity too.

See [the teaching sources and design notes](docs/accessible-mentoring.md) for EEF (UK) and CAST (US) guidance. Drafts require mentor/learner adaptation and teacher guidance; they are educational support, not medical treatment or formal individualized education plans. Use fictional preferences in this shared demo.

## Accessibility & learning support

This build merges the AllenOS accessibility and learning feature set into CampusLoop. Both feature sets ship together and are wired into the same application shell.

The floating accessibility button (bottom-left) and the header controls open:

- **Accessibility Suite** — high-contrast and large-text modes, visual edge-glow alerts, and a single place to reach every assistive tool. Preferences persist per browser.
- **Live Captions** — browser speech recognition when supported and microphone access is granted, with a typed-note alternative. AI summaries need a configured Gemini key. Capture stops when closed, reset or switched to another persona.
- **Sign-language practice** — an illustrative virtual hand, letters/numbers and campus prompts. This is a practice prototype, not a validated ISL/ASL interpreter; sign languages differ and instruction should be checked with a qualified teacher.
- **Mute AAC Screen** — large on-screen quick-prompt cards so non-verbal students can take part in a book handover or mentoring session without speaking.
- **AI Polyglot Translation** — live AI content translation across the supported language list. Interface labels use a bundled dictionary with English fallback where a translation is missing.

**Virtual Study Rooms** live under **Peer Mentoring → Virtual Study Rooms**. Rooms support text messages, hand-raising, saved study notes, a local drawing board, AAC quick prompts and illustrative fingerspelling. Joining a mentoring session can open a private room for its learner and mentor. Room state stays in this browser; there is no network collaboration or voice/video call. Drawing strokes are temporary; use study notes to save text.

The server also exposes the AllenOS assistive endpoints alongside `/api/loop-ai`:

| Endpoint | Purpose |
|---|---|
| `POST /api/translate` | Translate a single string |
| `POST /api/translate-batch` | Translate a JSON array of strings |
| `POST /api/accessibility/summarize-captions` | Summarise live-caption transcripts |
| `POST /api/tutor/scan-page` | Analyse a textbook page |
| `POST /api/tutor/generate-video` | Build an educational video prompt |
| `POST /api/tutor/generate-quiz` | Generate a practice quiz |
| `POST /api/tutor/chat` | Answer a textbook doubt |

Requests that need AI report an explicit offline state without `GEMINI_API_KEY`. The app retains original text when translation is unavailable; it does not invent translations, scanned pages or tutoring results. The AI concept helper requests the room's actual topic. The tutor endpoints are server capabilities; this merge does not add a textbook-scanner interface or generate playable videos. The video endpoint returns a lesson/video prompt only.

All eight AI endpoints share a connection-based request limit. Page scans accept validated JPEG/PNG/WebP images up to 4 MiB decoded; text routes retain a smaller request limit. Regression tests use injected providers to verify valid replies, malformed output, unavailable services and sanitized errors without paid API calls.

The interface uses a warm neutral palette, green accents, simpler navigation and calmer student-facing copy. Accessibility preferences remain available, keyboard focus is visible, and reduced-motion preferences are respected.

## Demo boundaries

Persona switching and campus state are stored in browser local storage. This repository does not implement Firebase authentication, a server-backed campus database, or real payments. Role checks protect the demo workflows; they are not a production security boundary. State updates are coordinated within one running provider, not across independent tabs or devices.

The AI endpoint treats all browser-supplied context as untrusted demo data and limits requests by the connecting IP address. Shared networks/proxies share that limit. Production use needs authenticated sessions, server-side authorization and data persistence, plus a deployment-specific trusted-proxy and distributed rate-limit configuration.
