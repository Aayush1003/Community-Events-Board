"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EventCard } from "@/components/EventCard";

type FeedEvent = {
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

export default function MyFeedPage() {
  const router = useRouter();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    async function loadFeed() {
      const meResponse = await fetch("/api/auth/me", { credentials: "include" });
      if (!meResponse.ok) {
        router.push("/login");
        return;
      }

      setUserLoggedIn(true);

      const response = await fetch("/api/feed", { credentials: "include" });
      if (!response.ok) {
        setError("Could not load your feed.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setEvents(data.events || []);
      setLoading(false);
    }

    void loadFeed();
  }, [router]);

  async function toggleReminder(eventId: string) {
    const response = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Unable to update reminder.");
      return;
    }

    setEvents((current) => current.map((event) => (event.id === eventId ? { ...event, isReminder: data.isReminder } : event)));
  }

  if (loading) {
    return <div className="text-center text-slate-600">Loading your feed...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Personalized</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">My Feed</h1>
        </div>
      </div>

      {error ? <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div> : null}

      {events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
          Your feed is empty right now. Pick your favourite categories to see local events here.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} userLoggedIn={userLoggedIn} onToggleReminder={toggleReminder} />
          ))}
        </div>
      )}
    </div>
  );
}
