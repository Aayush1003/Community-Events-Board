import Link from "next/link";

export function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/events" className="text-xl font-bold tracking-tight text-slate-900">
          Community Events Board
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/events">Events</Link>
          <Link href="/my-feed">My Feed</Link>
          <Link href="/preferences">Preferences</Link>
          <Link href="/login">Login</Link>
          <Link href="/signup">Signup</Link>
          <Link href="/admin/login" className="rounded-full bg-slate-900 px-3 py-2 text-white">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
