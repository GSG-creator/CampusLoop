# Deploy CampusLoop with Google AI Studio

This repository is prepared for a full-stack demo deployment: one Express process serves the React frontend and the AI API. There is no separate frontend API URL to configure.

## Import or update

1. Open [Google AI Studio Build](https://aistudio.google.com/apps).
2. For a new app, use **Add files (+) → Import from GitHub**, select **GSG-creator/CampusLoop**, and choose **main**. Authorize access to this private repository when prompted.
3. For an existing connected CampusLoop app, use **Settings → GitHub** to pull the latest main branch. Preserve any separate AI Studio edits before resolving a sync conflict.
4. Keep the existing React/Vite frontend and Express backend. The commands are listed below; a static-only preview does not serve the AI API.

Google documents the import and two-way sync workflow in [Build apps in Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-build-mode).

## Build and runtime settings

| Setting | Value |
| --- | --- |
| Node.js | 24 LTS |
| Install | `npm ci` |
| Development preview | `npm run dev` |
| Production build | `npm run build` |
| Google buildpack build | `npm run gcp-build` |
| Production start | `npm start` |
| Health endpoint | `/api/health` |
| Port | Use the host-provided `PORT` |

`npm start` serves the compiled application in production mode, without requiring the development TypeScript runner. Google buildpacks run the explicit `gcp-build` hook with build dependencies available and use the start script at runtime. See [Google's Node.js buildpack documentation](https://docs.cloud.google.com/docs/buildpacks/nodejs).

## AI configuration and publishing

In AI Studio's **Secrets** panel, confirm a server-side `GEMINI_API_KEY` is configured to enable live replies. The optional server variable `GEMINI_MODEL` overrides `gemini-3.8-flash`. Never put the key in source files or a `VITE_` variable. Without a key, CampusLoop still loads and clearly labels its assistant as offline, with local demo results.

Use **Publish**, review the offered Google project/tier, then **Publish App**. AI Studio deploys to Cloud Run. Starter Tier eligibility varies; standard deployment requires a linked project with billing enabled. See [Google's deployment instructions](https://ai.google.dev/gemini-api/docs/aistudio-deploying).

After publication, check that the home page loads, `/api/health` returns `status: "ok"`, and the assistant reports the expected live/offline state. Try an online or offline mentoring request, an adapted plan, and the demo reset confirmation.

## Optional direct Cloud Run container

The included multi-stage `Dockerfile` builds the frontend and server, then installs runtime dependencies only. It excludes local credentials and runs as the non-root Node user. Build with `docker build -t campusloop .`; run locally with `docker run --rm -e PORT=8080 -p 8080:8080 campusloop`. Supply secrets through the hosting platform when publishing, never through the image.

The server accepts the injected `PORT` and binds to `0.0.0.0`, as required by [Cloud Run's container contract](https://docs.cloud.google.com/run/docs/container-contract). `.gcloudignore` also excludes local credentials and generated files from source uploads.

## Demo scope

Deploying this repository preserves its browser-local demo behavior. Accounts, credits and learning plans are not shared between users or devices; persona switching is not authentication. Use fictional learner preferences. Real campus rollout needs authenticated users, a shared database and server-side authorization. The API's connection-based rate limit is per instance and may be shared by clients behind Google's proxy; it is not a distributed usage quota.
