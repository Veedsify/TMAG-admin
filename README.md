# TMAG Super Admin

The Super Admin app is the internal TMAG platform administration console. It is intended for trusted platform operators who manage users, companies, plans, credits, AI logs, roles, doctors, ebooks, affiliates, and system configuration.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- TanStack Query
- Zustand
- Axios
- Recharts and Lucide React

## Local URL

`bun run dev` starts the app on port `3001`:

```text
http://localhost:3001/admin
```

The root path redirects to `/admin`.

## Setup

```bash
cd super-admin
bun install
cp .env.example .env
```

Update `.env` with local values:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_KEY=<same-value-as-backend-APP_API_KEY>
```

Do not commit `.env` files or real secrets.

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start the development server on port `3001`. |
| `bun run build` | Run TypeScript project build and create the Vite production bundle. |
| `bun run lint` | Run ESLint. |
| `bun run preview` | Preview the production build locally. |

## Main route areas

All authenticated routes live under `/admin`:

- `/admin/dashboard` platform overview.
- `/admin/users` and `/admin/users/:id` user management.
- `/admin/companies` and `/admin/companies/:id` company management.
- `/admin/ledger` credit ledger and transactions.
- `/admin/ai-logs` AI request monitoring.
- `/admin/plans`, `/admin/escalated-plans`, and `/admin/credit-plans` travel and credit plan management.
- `/admin/analytics` usage, destination, credit, and revenue analytics.
- `/admin/system/status`, `/admin/system/logs`, and `/admin/system/settings` system operations.
- `/admin/roles` and `/admin/admin-users` access control.
- `/admin/ebooks` ebook catalog administration.
- `/admin/company-registrations`, `/admin/doctors`, and `/admin/affiliates` review queues and partner management.

## Project structure

```text
super-admin/
├── src/
│   ├── api/          # Axios client, hooks, API types, and endpoint wrappers
│   ├── components/   # Layout, page header, stat cards, and shared UI
│   ├── context/      # Auth context
│   ├── lib/          # Query client, currency helpers, and utilities
│   ├── pages/        # Admin route pages
│   ├── routes/       # React Router setup
│   └── stores/       # Admin auth/data/sidebar stores
├── package.json
└── vite.config.ts
```

## API integration

- API base defaults to `http://localhost:8080/api`.
- Requests send `X-Api-Key: VITE_API_KEY`.
- Super-admin authentication uses backend routes under `/api/v1/admin/auth/*`.
- Auth stores the platform admin JWT in the `admin_access_token` cookie.
- Non-auth `401` or `403` responses clear the cookie and redirect to `/admin`.

## Development workflow

1. Start `spring-server` on port `8080` with admin auth and a matching `APP_API_KEY`.
2. Start this app with `bun run dev`.
3. Validate changes with `bun run build` and `bun run lint`.
