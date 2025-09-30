# Frontend Applications

This folder contains the frontend application:

- **app/** - Next.js mobile-first progressive web application

The application can be run with `bun run dev:web` from the root directory.

## Supabase Auth Setup

1. Install dependencies (already added):

```
bun add @supabase/supabase-js
```

2. Create `apps/web/.env.local` with your Supabase project keys:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

3. Start the app:

```
bun run dev:web
```

4. For phone testing on the same Wi‑Fi, run Next bound to the network and update `NEXT_PUBLIC_SUPABASE_URL` to your project URL (no localhost needed):

```
bunx next dev --turbopack --hostname 0.0.0.0 --port 3001
```