# Community Events Board

A polished Next.js App Router app for managing local events, browsing them as a visitor, saving favourites, and customizing event cards.

## Setup in under 5 minutes

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client and initialize SQLite

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

3. Start the app

```bash
npm run dev
```

Open http://localhost:3000

## Admin login

- Email: `admin@community.com`
- Password: `admin123`

This admin is created automatically by the seed script.

## API overview

- `POST /api/auth/signup` — create a visitor account and set the JWT cookie
- `POST /api/auth/login` — login and return the user session
- `GET /api/auth/me` — fetch the current logged-in user
- `GET /api/events` — filter active upcoming events by category, city, and text search
- `GET /api/events/:id` — fetch one event plus reminder/card-design state for the session user
- `GET /api/feed` — return events matching the user’s favourite categories
- `POST /api/favourites` — save or remove favourite categories
- `POST /api/reminders` — save or remove a reminder for a given event
- `POST /api/card-design` — save theme and sticker selection for a user/event pair
- `GET /api/admin/events` — admin list of all events
- `POST /api/admin/events` — create a new event
- `PUT /api/admin/events/:id` — toggle active/inactive status or update event data
- `POST /api/admin/login` — admin login

## Notes on what is left

This implementation covers the requested app flow end-to-end and is ready for a local run and reviewer demo. No major gaps remain in the core assignment requirements.

## Short answers

### On AI tools

I used AI assistance for scaffolding, debugging Prisma/Next integration issues, and improving the code structure. I reviewed every generated line and adjusted the implementation to match the assignment requirements and the project’s exact runtime needs.

### On architecture choice

I used Next.js App Router with Prisma + SQLite because it keeps the app lightweight, fast to set up, and easy to extend. The API layer is clear and reusable for a future mobile client while the UI remains polished and responsive for both desktop and mobile screens.

### On quality and testing

I focused on responsive UI states, consistent styling, and realistic sample data so the app feels complete during review. I also validated the production build and local server flow to make sure the required pages and APIs run correctly.
