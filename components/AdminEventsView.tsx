"use client";

import { type FormEvent, useEffect, useState, useMemo } from "react";
import {
  PlusCircle,
  LayoutList,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Search,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/format";

const categories = ["Music", "Workshop", "Food", "Sports", "Kids"];

const sampleImages: Record<string, string> = {
  Music: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop",
  Workshop: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop",
  Food: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop",
  Kids: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800&auto=format&fit=crop",
};

type EventItem = {
  id: string;
  title: string;
  category: string;
  city: string;
  dateTime: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

type EventForm = {
  title: string;
  category: string;
  city: string;
  dateTime: string;
  price: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

const defaultForm: EventForm = {
  title: "",
  category: "Music",
  city: "",
  dateTime: "",
  price: "0",
  description: "",
  imageUrl: sampleImages.Music,
  isActive: true,
};

export default function AdminEventsView() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((c) => (c === msg ? null : c)), 3000);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        const response = await fetch("/api/admin/events", { credentials: "include" });
        const data = await response.json();

        if (!isMounted) return;

        setEvents(data.events || []);
        setLoading(false);
      } catch {
        if (isMounted) setLoading(false);
      }
    }

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreating(true);

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          isActive: Boolean(form.isActive),
        }),
        credentials: "include",
      });

      const data = await response.json();
      setCreating(false);

      if (!response.ok) {
        setError(data.error || "Unable to create event.");
        return;
      }

      setForm({ ...defaultForm, imageUrl: sampleImages[defaultForm.category] });
      setEvents((current) => [data.event, ...current]);
      showToast(`Event "${data.event.title}" created successfully!`);
    } catch {
      setCreating(false);
      setError("An unexpected error occurred.");
    }
  }

  async function toggleStatus(eventId: string, nextState: boolean) {
    // Optimistic update
    setEvents((current) =>
      current.map((item) => (item.id === eventId ? { ...item, isActive: nextState } : item))
    );

    const response = await fetch(`/api/admin/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: nextState }),
      credentials: "include",
    });

    if (!response.ok) {
      setError("Could not update event status.");
      // Rollback
      setEvents((current) =>
        current.map((item) => (item.id === eventId ? { ...item, isActive: !nextState } : item))
      );
    } else {
      showToast(`Event marked as ${nextState ? "Active" : "Inactive"}.`);
    }
  }

  async function deleteEvent(eventId: string, title: string) {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        showToast("Unable to delete event.");
        return;
      }

      setEvents((current) => current.filter((item) => item.id !== eventId));
      showToast(`Deleted "${title}".`);
    } catch {
      showToast("Error deleting event.");
    }
  }

  // Quick preset image selector
  function handleCategoryChange(cat: string) {
    setForm((f) => ({
      ...f,
      category: cat,
      imageUrl: sampleImages[cat] || f.imageUrl,
    }));
  }

  // Stats
  const activeCount = useMemo(() => events.filter((e) => e.isActive).length, [events]);
  const inactiveCount = useMemo(() => events.filter((e) => !e.isActive).length, [events]);
  const uniqueCities = useMemo(() => new Set(events.map((e) => e.city.toLowerCase())).size, [events]);

  // Filtered Events
  const displayedEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.city.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "All" || e.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [events, search, filterCategory]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ─── Admin Dashboard Header ─── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(168,85,247,0.1) 100%)",
          border: "1px solid var(--glass-border)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-lg"
                style={{ background: "rgba(255,107,53,0.2)" }}
              >
                <Sparkles size={14} style={{ color: "var(--accent-orange)" }} />
              </span>
              <span className="section-label">Administration Portal</span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Event Management & Overview
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Create, curate, activate, and manage public community events in real time.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap gap-3">
            <div className="stat-card">
              <div>
                <span className="text-2xl font-black text-white">{events.length}</span>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Total Events
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <span className="text-2xl font-black text-emerald-400">{activeCount}</span>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Active
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <span className="text-2xl font-black text-slate-400">{inactiveCount}</span>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Inactive
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <span className="text-2xl font-black text-purple-400">{uniqueCities}</span>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Cities
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid gap-8 lg:grid-cols-[400px_1fr] items-start">
        {/* ─── Create Event Panel ─── */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "rgba(255,107,53,0.15)" }}
            >
              <PlusCircle size={18} style={{ color: "var(--accent-orange)" }} />
            </span>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Publish New Event
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Title
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Indie Music Showcase"
                className="form-input text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="form-input text-sm"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  City
                </label>
                <input
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="form-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.dateTime}
                  onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                  className="form-input text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="form-input text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cover Image URL
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, imageUrl: sampleImages[form.category] || "" })
                  }
                  className="text-[11px] text-orange-400 hover:underline"
                >
                  Use preset image
                </button>
              </div>
              <input
                type="url"
                required
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="form-input text-sm"
              />

              {/* Live Image Preview */}
              {form.imageUrl && (
                <div className="mt-2 relative h-28 w-full overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="absolute bottom-1 right-2 text-[10px] bg-black/70 px-1.5 py-0.5 rounded text-white font-mono">
                    Preview
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Description
              </label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what attendees will experience..."
                className="form-input text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="is-active-chk"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="is-active-chk" className="text-xs text-slate-300 font-medium cursor-pointer">
                Publish immediately as Active
              </label>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl mt-2"
            >
              <span>{creating ? "Publishing Event..." : "Create Event"}</span>
            </button>
          </form>
        </div>

        {/* ─── Manage Events List ─── */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          {/* List Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "rgba(168,85,247,0.15)" }}
              >
                <LayoutList size={18} style={{ color: "var(--accent-purple)" }} />
              </span>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                All Published Events ({displayedEvents.length})
              </h2>
            </div>

            {/* Search within Admin */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-2.5 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by title, city..."
                  className="form-input pl-8 py-1.5 text-xs w-48"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="form-input py-1.5 text-xs w-32"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="shimmer h-24 rounded-2xl" />
              ))}
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="rounded-2xl border border-white/10 p-12 text-center text-slate-400 text-sm">
              No events found matching your search.
            </div>
          ) : (
            <div className="space-y-3">
              {displayedEvents.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-4 transition-all"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-16 w-16 rounded-xl object-cover shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-orange text-[10px] py-0.5 px-2">
                          {item.category}
                        </span>
                        <span
                          className={`badge ${
                            item.isActive ? "badge-emerald" : "badge-slate"
                          } text-[10px] py-0.5 px-2`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <h3 className="mt-1 text-sm font-bold text-white line-clamp-1">
                        {item.title}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-purple-400" />
                          {item.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-orange-400" />
                          {formatDateTime(item.dateTime)}
                        </span>
                        <span className="font-semibold text-slate-300">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleStatus(item.id, !item.isActive)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        item.isActive
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20"
                      }`}
                      title="Toggle Active Status"
                    >
                      {item.isActive ? (
                        <>
                          <ToggleRight size={16} className="text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={16} className="text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteEvent(item.id, item.title)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                      title="Delete event"
                      aria-label="Delete event"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
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
