# Orzu / Yordamchi AI frontend

Existing Telegram Mini App for the Standard, presentation and design screens. Generation runs on the Alwaysdata backend; no AI or Supabase server credentials belong in this browser app.

## Development and checks

Use the existing isolated checkout, without creating a worktree. Node24 and the committed npm lockfile are supported.

```bash
npm ci
npm test
npm run build
npm run dev
```

The development server proxies `/api` and `/static` to a local backend at `http://127.0.0.1:8000`. A live account requires Telegram initData; there is no public production test-login endpoint. Component tests mock transport and do not call paid AI, create production orders, or spend credits.

## Production on Vercel

This repository is a Vite project; build command `npm run build`, output directory `dist`. In the existing `orzu-two` Vercel project connect this Git repository and use the production branch. Keep the existing domain so bot URLs continue to work. If Vercel has a `VITE_API_BASE` environment override, set it to:

```text
https://sardorbekuralov.alwaysdata.net/api/v1
```

The checked-in `.env.production` has the same public API URL. After environment changes, redeploy. The backend CORS origin must continue to permit the existing frontend domain. Never enter OpenRouter, Supabase service-role, or bot tokens under any `VITE_` variable: those values become public browser code.

## Service contract

Article remains in the existing Standard screen. `?tab=standard`, `?tab=articles`, `?tab=presentations`/`pro`, `?tab=designs`, `?tab=account` and existing `?job=<UUID>` links are supported. Coursework and referat cards open the existing Telegram bot conversation rather than a duplicate backend miniapp.

GET `/api/v1/commerce` controls all prices and generation buttons. Referat, article and obyektivka share three lifetime free uses; later orders cost one common referral credit each. There is no admin pricing exemption. Missing account data is shown as loading, not free. The backend remains authoritative under concurrent requests; errors refresh the account so free reservations or credits can be returned.

Stable UUIDs identify article, presentation, design and obyektivka requests. Retrying an uncertain request reuses its UUID. Re-downloading a finished file never creates a new charge. Obyektivka local PDF/print/copy exports unlock after successful server generation for unchanged form data; downloading the same document again is free.

Run `npm test` for pricing display, account loading, exhausted allowance, admin handling, duplicate-submit/recovery, job-delivery reporting and download extension coverage.
