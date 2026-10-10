"use client";

import { type FormEvent, useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/format";

const categories = ["Music", "Workshop", "Food", "Sports", "Kids"];

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
  imageUrl: "",
  isActive: true,
};

export default function AdminEventsView() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      const response = await fetch("/api/admin/events", { credentials: "include" });
      const data = await response.json();

      if (!isMounted) {
        return;
      }

      setEvents(data.events || []);
      setLoading(false);
    }

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

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

    if (!response.ok) {
      setError(data.error || "Unable to create event.");
      return;
    }

    setForm(defaultForm);
    setEvents((current) => [data.event, ...current]);
  }

  async function toggleStatus(eventId: string, nextState: boolean) {
    const response = await fetch(`/api/admin/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: nextState }),
      credentials: "include",
    });

    if (response.ok) {
      setEvents((current) => current.map((item) => (item.id === eventId ? { ...item, isActive: nextState } : item)));
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <PlusCircle className="text-orange-600" />
          <h2 className="text-2xl font-bold text-slate-900">Add event</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
              <input
                required
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Date & time</label>
              <input
                type="datetime-local"
                required
                value={form.dateTime}
                onChange={(event) => setForm((current) => ({ ...current, dateTime: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
              <input
                type="number"
                min={0}
                required
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Image URL</label>
            <input
              required
              type="url"
              value={form.imageUrl}
              onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="font-medium text-slate-700">Active</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              className="h-5 w-5 accent-orange-500"
            />
          </div>

          {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Save event
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">All listings</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Events</h2>
        </div>

        {loading ? <div className="text-slate-600">Loading events...</div> : null}

        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img src={event.imageUrl} alt={event.title} className="h-20 w-20 rounded-xl object-cover" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                  <p className="text-sm text-slate-600">{event.city} • {event.category}</p>
                  <p className="text-sm text-slate-600">{formatDateTime(event.dateTime)}</p>
                  <p className="text-sm text-slate-600">{formatPrice(event.price)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${event.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                  {event.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleStatus(event.id, !event.isActive)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                >
                  {event.isActive ? "Set inactive" : "Set active"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
