"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { EventCard } from "@/components/EventCard";

const categories = ["All", "Music", "Workshop", "Food", "Sports", "Kids"];

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

  useEffect(() => {
    async function fetchCurrentUser() {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (response.ok) {
        setUserLoggedIn(true);
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

      const response = await fetch(`/api/events?${params.toString()}`, { credentials: "include" });

      if (!response.ok) {
        setError("We could not load upcoming events right now.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setEvents(data.events || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    }

    void loadEvents();
  }, [category, city, search, page]);

  async function toggleReminder(eventId: string) {
    const response = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Unable to save this reminder.");
      return;
    }

    setEvents((current) => current.map((event) => (event.id === eventId ? { ...event, isReminder: data.isReminder } : event)));
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Browse</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Upcoming events</h1>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.5fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
            <input
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setPage(1);
              }}
              placeholder="Search city"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Try “night” or “workshop”"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div> : null}

      {loading ? (
        <div className="text-center text-slate-600">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
          No events match your filters right now. Try a different category or search term.
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600">
            <SlidersHorizontal size={16} />
            Showing {events.length} result{events.length > 1 ? "s" : ""}
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} userLoggedIn={userLoggedIn} onToggleReminder={toggleReminder} />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
