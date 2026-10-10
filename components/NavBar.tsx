"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Sparkles,
  CalendarDays,
  Rss,
  Settings,
  LogIn,
  UserPlus,
  Shield,
  LogOut,
  User,
} from "lucide-react";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    }

    void checkAuth();
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setCurrentUser(null);
      router.push("/login");
      router.refresh();
    } catch {
      // fallback
    }
  }

  const baseLinks = [
    { href: "/events", label: "Events", icon: CalendarDays },
    { href: "/my-feed", label: "My Feed", icon: Rss },
    { href: "/preferences", label: "Preferences", icon: Settings },
  ];

  return (
    <header className="nav-header">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link href="/events" className="group flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 0 24px var(--accent-orange-glow)",
            }}
          >
            <Sparkles size={20} className="text-white" />
          </span>
          <div className="flex flex-col">
            <span
              className="text-lg font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Community<span className="gradient-text">Events</span>
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider -mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              Discover & Share
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links-desktop">
          {baseLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  border: active ? "1px solid var(--glass-border)" : "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <link.icon size={15} />
                {link.label}
              </Link>
            );
          })}

          {/* Admin link */}
          <Link
            href={currentUser?.role === "ADMIN" ? "/admin/events" : "/admin/login"}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ml-1"
            style={{
              background: pathname.startsWith("/admin")
                ? "var(--gradient-primary)"
                : "rgba(255,107,53,0.12)",
              color: pathname.startsWith("/admin") ? "#fff" : "#ff8c5a",
              border: "1px solid rgba(255,107,53,0.25)",
              boxShadow: pathname.startsWith("/admin")
                ? "0 0 20px var(--accent-orange-glow)"
                : "none",
            }}
          >
            <Shield size={14} />
            {currentUser?.role === "ADMIN" ? "Admin Portal" : "Admin"}
          </Link>

          {/* Auth State Button */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10 ml-2">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-primary)",
                }}
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold text-white uppercase"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {currentUser.email.charAt(0)}
                </div>
                <span className="max-w-[120px] truncate">{currentUser.email}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-500/20 transition-all duration-200"
                title="Log out"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10 ml-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all"
                style={{
                  color: "var(--text-secondary)",
                  background: pathname === "/login" ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                <LogIn size={15} />
                Login
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-xs py-2 px-3.5 rounded-xl"
              >
                <UserPlus size={14} />
                Sign up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-toggle flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            color: "var(--text-primary)",
            border: "1px solid var(--glass-border)",
            background: "rgba(255,255,255,0.05)",
          }}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileOpen && (
        <div
          className="border-t px-5 pb-6 pt-3"
          style={{
            borderColor: "var(--glass-border)",
            background: "rgba(12, 12, 18, 0.98)",
            backdropFilter: "blur(25px)",
          }}
        >
          <nav className="flex flex-col gap-1.5">
            {baseLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium"
                  style={{
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  }}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              );
            })}

            <Link
              href={currentUser?.role === "ADMIN" ? "/admin/events" : "/admin/login"}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
              style={{
                color: "#ff8c5a",
                background: "rgba(255,107,53,0.1)",
              }}
            >
              <Shield size={16} />
              {currentUser?.role === "ADMIN" ? "Admin Portal" : "Admin Login"}
            </Link>

            <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <User size={14} />
                    <span className="truncate max-w-[180px]">{currentUser.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      void handleLogout();
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-400 py-1.5 px-3 rounded-lg bg-rose-500/10"
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary py-2 text-center text-xs"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary py-2 text-center text-xs"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
