# my-landing

Personal landing site. Built with React + TypeScript + Next.js (App Router).

## Develop

```sh
npm run dev
```

Open http://localhost:3000.

Set `GH_TOKEN` in `.env.local` for the contribution heatmap to work locally:

```sh
GH_TOKEN=your_token npm run dev
# or add GH_TOKEN=your_token to .env.local
```

## Build

```sh
npm run build
```

## Deploy (Vercel)

Set `GH_TOKEN` (or `GITHUB_TOKEN`) in Vercel project environment variables (Production + Preview). The heatmap data is fetched server-side at request time and cached for 1 hour — no pre-build step needed.

Use a token with `read:user` if private contribution counts should be included.

## GitHub contribution heatmap

The heatmap is powered by `GET /api/contributions` — a Next.js route handler that calls the GitHub GraphQL API using `GH_TOKEN` from the server environment. The token is never exposed to the browser.

A fallback pre-build script is still available for local dev without a token:

```sh
GH_TOKEN=your_token npm run contributions:fetch
```

This writes `public/github-contributions.json`. The dev server will serve it as a fallback if you temporarily point the fetch URL back to that file, but it is not used in production.
