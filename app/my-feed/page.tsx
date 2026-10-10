"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Inbox, Settings, CheckCircle2 } from "lucide-react";
import Link from "next/link";
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
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((c) => (c === msg ? null : c)), 3000);
  }

  useEffect(() => {
    async function loadFeed() {
      try {
        const meResponse = await fetch("/api/auth/me", { credentials: "include" });
        if (!meResponse.ok) {
          router.push("/login");
          return;
        }

        setUserLoggedIn(true);

        const favRes = await fetch("/api/favourites", { credentials: "include" });
        if (favRes.ok) {
          const favData = await favRes.json();
          setUserCategories(favData.categories || []);
        }

        const response = await fetch("/api/feed", { credentials: "include" });
        if (!response.ok) {
          setError("Could not load your feed.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setEvents(data.events || []);
        setLoading(false);
      } catch {
        setError("Error loading your personalized feed.");
        setLoading(false);
      }
    }

    void loadFeed();
  }, [router]);

  async function toggleReminder(eventId: string) {
    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Unable to update reminder.");
        return;
      }

      const target = events.find((e) => e.id === eventId);
      showToast(
        data.isReminder
          ? `Reminder saved for "${target?.title || "event"}"!`
          : "Reminder removed."
      );

      setEvents((current) =>
        current.map((event) =>
          event.id === eventId ? { ...event, isReminder: data.isReminder } : event
        )
      );
    } catch {
      showToast("Error updating reminder.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer h-40 rounded-3xl" />
        <div className="events-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-[440px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ─── Hero Header ─── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
        style={{
          background:
            "linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(6,182,212,0.1) 50%, rgba(16,185,129,0.08) 100%)",
          border: "1px solid var(--glass-border)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-lg"
                style={{ background: "rgba(168,85,247,0.25)" }}
              >
                <Sparkles size={14} style={{ color: "var(--accent-purple)" }} />
              </span>
              <span className="section-label">Personalized Stream</span>
            </div>
            <h1
              className="text-4xl font-extrabold tracking-tight sm:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              My <span className="gradient-text">Feed</span>
            </h1>
            <p className="mt-3 max-w-lg text-base text-slate-300">
              Curated events matching your favourite topics and lifestyle.
            </p>

            {/* User Selected Category Chips */}
            {userCategories.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold mr-1">Active categories:</span>
                {userCategories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full px-3 py-1 text-xs font-bold text-purple-200"
                    style={{
                      background: "rgba(168,85,247,0.18)",
                      border: "1px solid rgba(168,85,247,0.3)",
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <Link
              href="/preferences"
              className="btn-secondary rounded-xl text-xs py-2.5 px-4 flex items-center gap-2 hover:border-purple-400"
            >
              <Settings size={15} />
              <span>Edit Preferences</span>
            </Link>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* ─── Feed Content ─── */}
      {events.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center max-w-2xl mx-auto">
          <Inbox
            size={56}
            className="mx-auto mb-4"
            style={{ color: "var(--accent-purple)", opacity: 0.8 }}
          />
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Your feed is currently empty
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {userCategories.length === 0
              ? "You haven't selected any favourite categories yet. Personalize your topics to start seeing events here!"
              : "There are no upcoming events in your selected categories right now. You can expand your preferences or browse all events."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/preferences" className="btn-primary text-sm px-6 py-2.5">
              Customize Categories
            </Link>
            <Link href="/events" className="btn-secondary text-sm px-6 py-2.5">
              Browse All Events
            </Link>
          </div>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              userLoggedIn={userLoggedIn}
              onToggleReminder={toggleReminder}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Toast Notification */}
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
