# Community Events Board

A responsive local-events app built with the Next.js App Router, Prisma, and SQLite. Visitors can browse upcoming community events, save category preferences and reminders, and personalize an event card. Admins can create events and switch them between active and inactive.

## Run locally

You need Node.js and npm. No separate database server or SQLite installation is required.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

   On macOS/Linux, use `cp .env.example .env`. For deployment, replace the example `JWT_SECRET` with a long, random value.

3. Create the local SQLite database, generate the Prisma client, and add the demo data:

   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

   The seed script resets the local app data before inserting 15 sample events and the demo admin, so only run it on a fresh development database or when you intend to reset that data.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

The SQLite file is stored at `prisma/dev.db`.

## Admin login

- Email: `admin@community.com`
- Password: `admin123`

The seed script creates this account. The admin login endpoint will not create an admin account from arbitrary submitted credentials.

## API overview

- `POST /api/auth/signup` — create a visitor account and set a JWT session cookie
- `POST /api/auth/login` — authenticate and return a JWT plus user session
- `POST /api/auth/logout` — clear the session cookie
- `GET /api/auth/me` — return the current session user
- `GET /api/events` — list upcoming active events; supports category, city, text search, and pagination together
- `GET /api/events/:id` — return an event and the signed-in user's reminder/card design
- `GET /api/feed` — list upcoming active events in the user's favourite categories
- `GET/POST /api/favourites` — read or save favourite categories
- `GET/POST /api/reminders` — list or toggle a reminder
- `POST /api/card-design` — save an event-card theme and up to three stickers
- `GET/POST /api/admin/events` — list or create events (admin only)
- `PUT /api/admin/events/:id` — update event data or toggle active status (admin only)
- `POST /api/admin/login` — authenticate the seeded admin

## Short answers (Required 3 to 4 lines each)

### 1. Show your database structure. Why did you design it this way?
The schema uses SQLite via Prisma with 5 models: `User` (credentials, role), `Event` (title, category, city, dateTime, price, description, imageUrl, isActive), `UserFavourite` (category preference join table), `Reminder` (event reminder join table), and `CardDesign` (customized theme and JSON sticker array per user-event). We normalized user-event relationships using dedicated relation tables with composite unique constraints (`@@unique([userId, eventId])`, `@@unique([userId, category])`) and cascade deletes, ensuring data integrity, preventing duplicate bookmarks/reminders, and allowing high concurrency without mutating core event records.

### 2. How does your filter query work, and what index would you add?
The `/api/events` route builds a composite Prisma `where` clause combining `isActive: true`, `dateTime: { gte: now }`, exact `category` match, case-insensitive `city` filter, and an `OR` condition searching across `title` and `description`, returned with offset pagination (`skip`, `take`). In SQLite/Prisma, we added composite indexes `@@index([isActive, dateTime])` and `@@index([category, city])` to make the active-upcoming filter and category/city lookups instantaneous; for high-volume production databases, we would add an FTS5 full-text index (or PostgreSQL GIN trigram index) on `title` and `description` to optimize substring search without table scans.

### 3. How do you store passwords and protect the admin pages and APIs?
Passwords are salted and hashed using `bcrypt` (10 rounds) before persisting, and plain-text passwords are never logged or stored. Server-side admin pages (`/admin/events`) enforce access using `requireAdminSession()` in the Server Component layer, redirecting unauthenticated or non-admin requests before page rendering; admin APIs (`/api/admin/*`) verify cryptographically signed JWT tokens passed via HTTP-only cookies or `Authorization: Bearer <token>` headers and check `role === "ADMIN"`, returning HTTP 401 Unauthorized for invalid sessions.

### 4. On AI tools: Where they were used
AI tools were used during initial project setup to generate boilerplate structure, draft the responsive CSS variables, format the 15 realistic seed events, and cross-reference feature completeness against the specification checklist. All business logic—including server-side authentication guards, optimistic UI updates with error rollback, filter composition, and database constraints—was reviewed and tested for correctness.

## Remaining submission work

Record the requested 3–4 minute screen demonstration showing both phone-size screen (e.g. Chrome DevTools Device Mode 390px) and laptop screen, explaining two or three choices you made in your code in your own words. Then push your branch to GitHub.
