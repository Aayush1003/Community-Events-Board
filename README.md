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

## Short answers

### AI tools

I used AI assistance to scaffold parts of the app, investigate integration issues, and review implementation choices. I checked the generated code against the assignment and adjusted the features to match the requested scope. The final code and demo should be reviewed by me before submission.

### Architecture

I chose Next.js App Router because it keeps the visitor and admin pages alongside their JSON API routes. Prisma provides typed database access, while SQLite keeps local setup quick and does not require running a separate database server. The API routes keep the data operations reusable beyond the web UI.

### Quality and testing

The production build, TypeScript check, and Prisma validation pass; ESLint reports no errors and four `<img>` optimization warnings. Smoke tests confirmed combined filters, protected admin APIs, invalid card-design rejection, and that inactive events are hidden from detail pages. The events page also fits the tested 390px mobile and 1440px laptop widths without horizontal overflow.

## Remaining submission work

Record the requested 3–4 minute screen demonstration yourself, showing both phone-size and laptop layouts and explaining a few implementation choices in your own words. Then push the finished repository to GitHub and confirm the setup instructions work from a clean clone.
