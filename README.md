# MIS Metal Construction — Backend API

Express + Supabase backend for the construction metal platform.
Authentication uses **Supabase Auth** (no custom JWT signing). Storage uploads
go through the service role key into Supabase Storage buckets.

## 1. Setup

```bash
cd back
npm install
cp .env.example .env   # then fill in the Supabase keys
```

Required env vars (`.env`):

| Variable                      | Where to find it (Supabase dashboard)              |
| ----------------------------- | -------------------------------------------------- |
| `SUPABASE_URL`                | Project Settings → API → Project URL               |
| `SUPABASE_ANON_KEY`           | Project Settings → API → anon / publishable key    |
| `SUPABASE_SERVICE_ROLE_KEY`   | Project Settings → API → service_role (keep secret)|
| `PORT`                        | default `4000`                                     |
| `CORS_ORIGIN`                 | comma-separated, default `http://localhost:3000`   |

## 2. Database

Open the Supabase SQL editor and run [`db/schema.sql`](db/schema.sql). It
creates the tables (`profiles`, `user_roles`, `products`, `employers`,
`projects`, `announcements`), updated-at triggers, RLS policies, and the
three public storage buckets (`products`, `projects`, `profiles`).

## 3. Run

```bash
npm run dev      # auto-reload (Node --watch)
npm start        # production
```

- API root:     <http://localhost:4000/>
- Swagger UI:   <http://localhost:4000/api/docs>
- Health check: <http://localhost:4000/api/health>

## 4. Architecture

```
src/
├── config/         env loading + Supabase clients
├── middleware/     auth (Bearer JWT → Supabase), roles, uploads, errors, validate
├── modules/
│   ├── auth/          /api/auth/{register,login,logout,me}
│   ├── users/         /api/profile/...
│   ├── products/      /api/products/...
│   ├── employers/     /api/employers/...
│   ├── projects/      /api/projects/...
│   └── announcements/ /api/announcements/...
├── routes/         aggregates module routers
├── utils/          response helpers + asyncHandler
├── app.js          Express composition (helmet/cors/rate-limit/swagger)
└── server.js       HTTP bootstrap

docs/swagger.js    swagger-jsdoc spec (parses JSDoc in route files)
db/schema.sql      Postgres schema + RLS + storage buckets
TEST.md            curl recipes for every endpoint
```

## 5. Authentication flow

1. Client (the Next.js frontend) calls `POST /api/auth/login` with email + password.
2. Backend forwards to `supabase.auth.signInWithPassword` and returns the
   `access_token` and `refresh_token`.
3. Client stores them and sends `Authorization: Bearer <access_token>` on every
   protected call.
4. `requireAuth` middleware validates the token with `supabase.auth.getUser` and
   loads the user's roles from `user_roles` into `req.user`.

The frontend can equally authenticate directly with the Supabase JS client; the
backend will still accept the same Bearer token.

## 6. Roles

The first admin must be inserted manually:

```sql
insert into public.user_roles (user_id, role)
values ('<auth.users.id of your admin>', 'admin');
```

Admin-only routes (`POST/PUT/DELETE` on products, employers, projects,
announcements, plus their `/upload` endpoints) require the `admin` role.
