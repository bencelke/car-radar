# CarRadar

CarRadar is a web-first car enthusiast discovery platform. It helps users find car communities, upcoming meets and events, tuning and mod shops, wrap and tint shops, detailers, wheel specialists, club areas, and Instagram links near them.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- [shadcn/ui](https://ui.shadcn.com)
- Firebase client (optional — mock data fallback when not configured)

## Current status

- **Day 1:** Premium dark dashboard UI prototype with mock map and discovery panels
- **Day 2:** Typed domain models, repository layer, seed data, and Firestore-ready structure (mock mode by default)
- **Not yet:** Mapbox, Firebase Auth, live GPS, chat, or marketplace

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` to `.env.local` and add Firebase or Mapbox keys when you connect those services. The app runs without them using mock data.

### Other commands

```bash
npm run build   # production build
npm run start   # run production build locally
npm run lint    # ESLint
```

## Project structure

```
app/              # Routes (dashboard, map, events, shops, communities, submit, admin)
components/       # UI (dashboard panels, layout, submit form)
lib/
  config/         # Brand and theme config
  data/           # Dashboard data loaders
  firebase/       # Optional Firebase client
  mock-data/      # Seed data for mock mode
  repositories/   # Data access (Firestore + mock fallback)
  types/          # Domain and UI types
docs/             # Firestore schema notes
scripts/          # Seed script placeholder
```

## Environment variables

See `.env.example` for optional `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` values. Do not commit `.env.local` or other secret files.

## License

Private project — all rights reserved unless otherwise specified.
