# Community Events Board — Demo & Interview Master Study Guide

This document is your single reference guide for recording your **3 to 4 minute demo video** and preparing for **technical interview questions** on architecture, security, database design, and code flow.

---

## 1. Quick Credentials & Access

| Role | Email | Password | Access URL | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@community.com` | `admin123` | `/admin/login` | Created via `prisma/seed.ts`. Has `ADMIN` role. |
| **Visitor (Demo)** | Create any via `/signup` (e.g. `visitor@test.com`) | `password123` | `/login` or `/signup` | Regular visitor account with `USER` role. |

- **Local Server**: `http://localhost:3000`
- **Database**: Local SQLite database stored at `prisma/dev.db`
- **Session Cookie**: `community_events_token` (HTTP-only, Lax, 7 days)
- **Token Auth**: Also supports `Authorization: Bearer <token>` headers for mobile clients.

---

## 2. 3 to 4 Minute Screen Recording Script (Step-by-Step Cue Card)

Follow this precise timeline while recording your screen. Keep Chrome DevTools ready.

### [0:00 – 0:50] Mobile View Demo (Phone-Size Screen)
1. **Setup**: Open Chrome DevTools (`F12`), toggle **Device Toolbar** (`Ctrl+Shift+M`), select **iPhone 12 / 390px width**.
2. **Show**:
   - Clean, modern UI with header branding and responsive hamburger navigation.
   - Event cards with Indian currency format (e.g., `₹499`, `₹1,50,000`) and friendly date badges (e.g., `Sat, 18 Oct, 6:30 PM`).
   - Tap the hamburger menu to show mobile navigation links (Events, My Feed, Preferences, Login, Admin).
   - Test filters on mobile: select category "Music", enter city "Coimbatore", type "night" in search. Show that only matching events appear.
   - Show pagination controls at the bottom.

### [0:50 – 1:45] Visitor Experience & Preferences (Laptop Screen)
1. **Setup**: Toggle device mode off to switch back to full laptop screen (1440px+).
2. **Show**:
   - Click **Sign Up** or **Login**. Log in with a visitor account (or sign up with a new email).
   - Notice the automatic redirect straight to `/preferences` to pick favorite categories.
   - Select categories: e.g. **Music** and **Food**. Click **Save Preferences**.
   - Show that it takes you to **My Feed** (`/my-feed`).
   - Notice **My Feed** displays *only* upcoming active events matching your chosen categories.
   - Click the **"Remind me"** button on any event card:
     - Show immediate optimistic UI state change (button turns gradient orange with glowing bell icon).
     - Refresh the browser page (`F5`) — show that the reminder state **persists**.

### [1:45 – 2:40] Event Card Designer (Live Animation & Persistence)
1. **Show**:
   - Click on an event card to view the Event Details page (`/events/[id]`).
   - Scroll down to the **"Design your card"** section.
   - **Theme switcher**: Switch between the 3 background themes:
     1. *Sunset Glow* (warm orange-rose gradient)
     2. *Ocean Depths* (blue-cyan gradient)
     3. *Cyber Neon* (purple-fuchsia gradient)
     - Show how the pass card preview smoothly transitions with live CSS animations.
   - **Stickers**: Tap stickers (`🎉`, `🎵`, `🌟`, `🍕`, `🎨`).
     - Show stickers dynamically appearing on the pass.
     - Show the max-3 constraint enforcement (trying to add a 4th sticker displays a toast notification).
     - Tap a sticker on the pass to remove it.
   - **Persistence**: Refresh the page (`F5`). Show that your selected theme and stickers are preserved from the database!

### [2:40 – 3:45] Admin Portal & Architecture Decisions (Explain in Your Own Words)
1. **Show**:
   - Navigate to `/admin/login` and log in with `admin@community.com` / `admin123`.
   - You are now on `/admin/events` (server-protected page).
   - Show the **"Create New Event"** form: fill title, category, city, date, price, description, and paste an image URL (show live image preview).
   - Show the event list below:
     - Toggle an event between **Active** and **Inactive** using the status button.
     - Highlight: *"Notice there is no delete button — as specified, events are only made active or inactive, preserving historical data and referential integrity."*
2. **Explain 2–3 Key Choices (Say this verbally):**
   - **Choice 1 (Server-Side Route Protection)**: *"For admin pages, we enforce authentication in Next.js Server Components (`requireAdminSession`) before any HTML is sent to the browser, while APIs verify signed JWT tokens independently. This eliminates client-side flash of protected content."*
   - **Choice 2 (Optimistic UI with Rollback)**: *"For user interactions like the 'Remind Me' button, we update the React UI instantly for zero perceived latency, but maintain an rollback fallback that restores previous state and displays a toast message if the API call fails."*
   - **Choice 3 (Normalized Relations & Dual Auth Transport)**: *"We normalized user favorites, reminders, and card designs into dedicated Prisma tables with composite unique constraints. Our API also supports both HTTP-only cookies for web browsers and `Authorization: Bearer` headers so a future mobile app can use the exact same endpoints."*

---

## 3. End-to-End Code Flow Explained (For Your Interview)

### A. Authentication & Password Security
- **Hashing**: Located in [prisma/seed.ts](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/prisma/seed.ts) and [app/api/auth/signup/route.ts](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/app/api/auth/signup/route.ts). Passwords are never stored in plain text. They are hashed using `bcrypt.hash(password, 10)` (10 salt rounds).
- **Verification**: In [app/api/auth/login/route.ts](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/app/api/auth/login/route.ts), incoming password is confirmed using `await bcrypt.compare(password, user.passwordHash)`.
- **JWT Issuance**: We create a signed JWT token containing `{ id, email, name, role }` with a 7-day expiration (`jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })`).
- **Dual Auth Transport**:
  1. The API sets an `httpOnly: true`, `sameSite: 'lax'`, `path: '/'` cookie (`community_events_token`) so web browsers automatically handle session cookies securely without JavaScript access (mitigating XSS token theft).
  2. The API also returns `{ token }` in the JSON response payload.
  3. [lib/auth.ts](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/lib/auth.ts) `getSessionFromRequest()` inspects `request.headers.get("authorization")` for `Bearer <token>` first, and falls back to the cookie. This makes all endpoints 100% compatible with mobile applications.
- **Server Component Guards**: [app/admin/events/page.tsx](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/app/admin/events/page.tsx) calls `await requireAdminSession()`. If not authenticated or not an admin, it issues a server-side redirect (`redirect('/admin/login')`) before rendering.

### B. Filter & Search Query Flow
- In [app/api/events/route.ts](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/app/api/events/route.ts):
  ```typescript
  const where: Prisma.EventWhereInput = {
    isActive: true,
    dateTime: { gte: new Date() }, // Only active, upcoming events
  };
  if (category) where.category = category;
  if (city) where.city = { contains: city };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  ```
- **Ordering**: `orderBy: { dateTime: "asc" }` ensures nearest dates appear first.
- **Pagination**: Offset-based pagination with `skip: (page - 1) * pageSize` and `take: pageSize` (6 items per page), returning `total` and `totalPages` to the client.

### C. Personalization & "My Feed" Flow
1. User logs in -> redirected to `/preferences` ([app/preferences/page.tsx](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/app/preferences/page.tsx)).
2. Selected categories are posted to `/api/favourites` ([app/api/favourites/route.ts](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/app/api/favourites/route.ts)), which stores records in the `UserFavourite` table.
3. User navigates to `/my-feed` ([app/my-feed/page.tsx](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/app/my-feed/page.tsx)).
4. Endpoint `/api/feed` queries the user's favorite categories and performs a Prisma query with `category: { in: categories }`, `isActive: true`, and `dateTime: { gte: new Date() }`.

### D. Optimistic UI & Reminders Flow
1. In [components/EventCard.tsx](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/components/EventCard.tsx) and [app/events/page.tsx](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/app/events/page.tsx):
   - When the user clicks "Remind me", `toggleReminder(eventId)` immediately inverts `isReminder` in component state (`optimisticReminder`).
   - An asynchronous POST is dispatched to `/api/reminders`.
   - If the request succeeds, state updates to confirmed DB status.
   - If the request fails (e.g. network failure or 401 unauthenticated), state rolls back to `previousReminder` and a user-friendly toast message is displayed.

### E. Event Card Designer Flow
1. Located in [app/events/[id]/page.tsx](file:///c:/Users/Dell/Desktop/freelance/Community-Events-Board/app/events/%5Bid%5D/page.tsx).
2. The user selects from 3 CSS gradients:
   - Sunset (`linear-gradient(135deg, #ff6b35, #ef4444)`)
   - Ocean (`linear-gradient(135deg, #06b6d4, #3b82f6)`)
   - Cyber (`linear-gradient(135deg, #a855f7, #ec4899)`)
3. The user picks up to 3 stickers from `['🎉', '🎵', '🌟', '🍕', '🎨']`.
4. Saves to database table `CardDesign` via `POST /api/card-design` (upsert on `[userId, eventId]`).
5. When reloading the event page, `GET /api/events/:id` hydrates `cardDesign` so the customized card is preserved.

---

## 4. The 3 Required README Answers (Quick Reference)

### Q1: Show your database structure. Why did you design it this way?
> The schema uses SQLite via Prisma with 5 models: `User`, `Event`, `UserFavourite`, `Reminder`, and `CardDesign`. We normalized user-event relationships using dedicated relation tables with composite unique constraints (`@@unique([userId, eventId])`, `@@unique([userId, category])`) and cascade deletes. This guarantees data integrity, avoids duplicate records, and supports high concurrency without mutating core event records.

### Q2: How does your filter query work, and what index would you add?
> The `/api/events` route builds a composite Prisma `where` clause combining `isActive: true`, `dateTime: { gte: now }`, exact `category` match, case-insensitive `city` filter, and an `OR` condition searching across `title` and `description`, returned with offset pagination (`skip`, `take`). In SQLite/Prisma, we added composite indexes `@@index([isActive, dateTime])` and `@@index([category, city])` to make the active-upcoming filter and category/city lookups instantaneous; for high-volume production databases, we would add an FTS5 full-text index (or PostgreSQL GIN trigram index) on `title` and `description` to optimize substring search without table scans.

### Q3: How do you store passwords and protect the admin pages and APIs?
> Passwords are salted and hashed using `bcrypt` (10 rounds) before persisting, and plain-text passwords are never logged or stored. Server-side admin pages (`/admin/events`) enforce access using `requireAdminSession()` in the Server Component layer, redirecting unauthenticated or non-admin requests before page rendering; admin APIs (`/api/admin/*`) verify cryptographically signed JWT tokens passed via HTTP-only cookies or `Authorization: Bearer <token>` headers and check `role === "ADMIN"`, returning HTTP 401 Unauthorized for invalid sessions.

---

## 5. Potential Interview Questions & Strong Answers

**Q: Why did you use Next.js App Router instead of Pages Router?**
*Answer:* App Router allows Server Components by default, which means sensitive operations like authenticating admin sessions and redirecting unauthenticated users happen on the server before client JavaScript runs. It also co-locates API Route Handlers in the same repository cleanly.

**Q: Why store tokens in an HTTP-only cookie if mobile apps need access?**
*Answer:* Web browsers are vulnerable to XSS attacks if JWTs are stored in `localStorage`. Using an HTTP-only cookie protects web users. To simultaneously support native mobile apps, our backend returns the token in the login/signup response body and our auth middleware accepts both the cookie and the `Authorization: Bearer <token>` header.

**Q: How does the "Remind me" button handle optimistic updates?**
*Answer:* As soon as the user clicks the button, the local React state updates immediately so the UI feels instant. In the background, a `fetch('/api/reminders')` is fired. If that network request errors out or returns an unauthorized status, the component catches the error, reverts the state back to its previous value, and triggers a toast notification informing the user.

**Q: Why not delete events in the admin view?**
*Answer:* In real community and ticketing systems, deleting records breaks referential integrity (reminders, card designs, user history, audit logs). Setting `isActive: false` performs a soft deactivation: it instantly removes the event from public visitor views while preserving system history and relational data.
