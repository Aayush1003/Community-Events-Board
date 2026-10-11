"use client";

import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CalendarDays,
  X,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { EventCard } from "@/components/EventCard";

const categories = ["All", "Music", "Workshop", "Food", "Sports", "Kids"];

const categoryIcons: Record<string, string> = {
  All: "🌐",
  Music: "🎵",
  Workshop: "🛠",
  Food: "🍕",
  Sports: "⚽",
  Kids: "🧒",
};

type EventListItem = {
  id: string;
  title: string;
  category: string;
  city: string;
  dateTime: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  isReminder?: boolean;
};

export default function EventsPage() {
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  }

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          setUserLoggedIn(true);
        }
      } catch {
        setUserLoggedIn(false);
      }
    }

    void fetchCurrentUser();
  }, []);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        category: category === "All" ? "" : category,
        city,
        search,
      });

      try {
        const response = await fetch(`/api/events?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          setError("We could not load upcoming events right now.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setEvents(data.events || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      } catch {
        setError("We could not load upcoming events right now.");
        setLoading(false);
      }
    }

    void loadEvents();
  }, [category, city, search, page]);

  async function toggleReminder(eventId: string) {
    if (!userLoggedIn) {
      showToast("Please log in to save reminders to your account.");
      return;
    }

    const targetEvent = events.find((e) => e.id === eventId);
    const previousReminder = Boolean(targetEvent?.isReminder);
    const optimisticReminder = !previousReminder;

    setEvents((current) =>
      current.map((event) =>
        event.id === eventId ? { ...event, isReminder: optimisticReminder } : event
      )
    );

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setEvents((current) =>
          current.map((event) =>
            event.id === eventId ? { ...event, isReminder: previousReminder } : event
          )
        );
        showToast(data.error || "Unable to save this reminder.");
        return;
      }

      setEvents((current) =>
        current.map((event) =>
          event.id === eventId ? { ...event, isReminder: data.isReminder } : event
        )
      );
      showToast(
        data.isReminder
          ? `Reminder set for "${targetEvent?.title || "event"}"!`
          : "Reminder removed."
      );
    } catch {
      setEvents((current) =>
        current.map((event) =>
          event.id === eventId ? { ...event, isReminder: previousReminder } : event
        )
      );
      showToast("Unable to save this reminder.");
    }
  }

  const filteredEvents = events;

  const hasActiveFilters = category !== "All" || city !== "" || search !== "";

  function clearAllFilters() {
    setCategory("All");
    setCity("");
    setSearch("");
    setPage(1);
  }

  return (
    <div className="space-y-8">
      {/* ─── Hero Section ─── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(168,85,247,0.1) 50%, rgba(6,182,212,0.08) 100%)",
          border: "1px solid var(--glass-border)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{ background: "rgba(255,107,53,0.2)" }}
            >
              <Sparkles size={14} style={{ color: "var(--accent-orange)" }} />
            </span>
            <span className="section-label">Discover Community</span>
          </div>
          <h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: "var(--text-primary)" }}
          >
            Find What’s Happening <br />
            <span className="gradient-text">Around Your City</span>
          </h1>
          <p
            className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Explore live music, art workshops, food pop-ups, sports meets, and family events. Connect with local culture and people.
          </p>

          {/* Quick Stats bar inside Hero */}
          <div className="mt-8 flex flex-wrap gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Community Board</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>•</span>
              <span>Instant Card Designer</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>•</span>
              <span>Custom Reminders</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Control Card ─── */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        {/* Category Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    setPage(1);
                  }}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
                  style={{
                    background: active ? "var(--gradient-primary)" : "rgba(255,255,255,0.04)",
                    color: active ? "#fff" : "var(--text-secondary)",
                    border: active ? "none" : "1px solid var(--glass-border)",
                    boxShadow: active ? "0 0 16px var(--accent-orange-glow)" : "none",
                  }}
                >
                  <span>{categoryIcons[item]}</span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 transition-colors"
            >
              <X size={13} />
              Reset filters
            </button>
          )}
        </div>

        {/* Inputs row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search Input */}
          <div className="sm:col-span-2">
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Search Events
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
                size={16}
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder='Search title, artist, or vibe (e.g. "Rock", "Pottery")'
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              City
            </label>
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
                size={16}
              />
              <input
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Mumbai, Bangalore..."
                className="form-input pl-10"
              />
            </div>
          </div>

        </div>

        {/* Results stats */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} />
            <span>
              Showing <strong className="text-white">{filteredEvents.length}</strong> events on this page
            </span>
          </div>
        </div>
      </div>

      {/* ─── Error Notification ─── */}
      {error && <div className="error-banner">{error}</div>}

      {/* ─── Event Grid or Empty State ─── */}
      {loading ? (
        <div className="events-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="shimmer h-[450px] rounded-2xl" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <CalendarDays
            size={52}
            className="mx-auto mb-4"
            style={{ color: "var(--accent-orange)", opacity: 0.8 }}
          />
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            No events match your selected criteria
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Try resetting your filters or changing the city and search keywords.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={clearAllFilters}
              className="btn-primary text-sm"
            >
              Reset all filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="events-grid">
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                userLoggedIn={userLoggedIn}
                onToggleReminder={toggleReminder}
                index={index}
              />
            ))}
          </div>

          {/* ─── Pagination ─── */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className="btn-secondary"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {page}
                </span>
                <span style={{ color: "var(--text-muted)" }}>of</span>
                <span>{totalPages}</span>
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                className="btn-secondary"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── Toast Feedback Notification ─── */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
