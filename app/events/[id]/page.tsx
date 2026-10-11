"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Tag,
  Sparkles,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Smile,
} from "lucide-react";
import Link from "next/link";
import { formatDateTime, formatPrice } from "@/lib/format";

type EventDetail = {
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
  cardDesign?: {
    theme: string;
    stickers: string[];
  };
};

const themes = [
  { label: "Sunset Glow", value: "sunset", className: "from-orange-400 via-pink-400 to-rose-300", textColor: "text-slate-900" },
  { label: "Ocean Breeze", value: "ocean", className: "from-cyan-300 via-sky-300 to-indigo-300", textColor: "text-slate-900" },
  { label: "Neon Cyber", value: "cyber", className: "from-purple-900 via-indigo-900 to-slate-950", textColor: "text-purple-100" },
];

const availableStickers = ["🎉", "🎵", "🌟", "🍕", "🎨"];

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [theme, setTheme] = useState("sunset");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 3000);
  }

  useEffect(() => {
    async function loadEvent() {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      try {
        const response = await fetch(`/api/events/${id}`, { credentials: "include" });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Event not found");
          setLoading(false);
          return;
        }

        setEvent(data);
        setTheme(
          themes.some((item) => item.value === data.cardDesign?.theme)
            ? data.cardDesign.theme
            : "sunset"
        );
        setSelectedStickers(
          Array.isArray(data.cardDesign?.stickers)
            ? data.cardDesign.stickers
                .filter((sticker: string) => availableStickers.includes(sticker))
                .slice(0, 3)
            : []
        );
        setLoading(false);
      } catch {
        setError("Unable to load event details.");
        setLoading(false);
      }
    }

    void loadEvent();
  }, [params.id]);

  async function saveDesign(nextTheme: string, nextStickers: string[]) {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) return;

    setSaving(true);
    try {
      const response = await fetch("/api/card-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: id,
          theme: nextTheme,
          stickers: nextStickers,
        }),
        credentials: "include",
      });
      setSaving(false);

      if (!response.ok) {
        showToast(
          response.status === 401
            ? "Log in to save your customized card design."
            : "Unable to save your card design. Please try again."
        );
      } else {
        showToast("Custom card design saved!");
      }
    } catch {
      setSaving(false);
      showToast("Unable to save your card design. Please try again.");
    }
  }

  async function toggleReminder() {
    if (!event) return;

    const previousReminder = Boolean(event.isReminder);
    const optimisticReminder = !previousReminder;
    setEvent((current) =>
      current ? { ...current, isReminder: optimisticReminder } : null
    );

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        setEvent((current) =>
          current ? { ...current, isReminder: previousReminder } : null
        );
        showToast(data.error || "Please log in to set event reminders.");
        return;
      }

      setEvent((current) => (current ? { ...current, isReminder: data.isReminder } : null));
      showToast(data.isReminder ? "Added to your reminders!" : "Removed from reminders.");
    } catch {
      setEvent((current) =>
        current ? { ...current, isReminder: previousReminder } : null
      );
      showToast("Unable to update reminder.");
    }
  }

  function handleThemeChange(nextTheme: string) {
    setTheme(nextTheme);
    void saveDesign(nextTheme, selectedStickers);
  }

  function handleAddSticker(emoji: string) {
    if (selectedStickers.length >= 3) {
      showToast("You can add up to 3 stickers.");
      return;
    }
    const next = [...selectedStickers, emoji];
    setSelectedStickers(next);
    void saveDesign(theme, next);
  }

  function handleRemoveSticker(index: number) {
    const next = selectedStickers.filter((_, i) => i !== index);
    setSelectedStickers(next);
    void saveDesign(theme, next);
  }

  if (loading) {
    return (
      <div className="detail-layout">
        <div className="shimmer h-155 rounded-3xl" />
        <div className="shimmer h-130 rounded-3xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto">
        <p className="text-lg font-semibold text-rose-300">{error || "Event not found."}</p>
        <Link href="/events" className="btn-secondary mt-6">
          <ArrowLeft size={16} />
          Return to Events
        </Link>
      </div>
    );
  }

  const selectedTheme = themes.find((item) => item.value === theme) || themes[0];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Navigation bar */}
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to all events
        </Link>
      </div>

      <div className="detail-layout">
        {/* Main Event Showcase */}
        <div className="glass-card overflow-hidden rounded-3xl shadow-2xl">
          {/* Banner Hero Image */}
          <div className="relative h-96 w-full overflow-hidden bg-slate-900">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              unoptimized
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.3) 50%, transparent 100%)",
              }}
            />

            {/* Overlays on Banner */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="badge badge-orange backdrop-blur-md shadow-lg text-xs py-1 px-3">
                {event.category}
              </span>

              <span
                className={`badge ${
                  event.isActive ? "badge-emerald" : "badge-slate"
                } backdrop-blur-md shadow-lg text-xs py-1 px-3`}
              >
                {event.isActive ? "● Active Event" : "○ Inactive"}
              </span>
            </div>

            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-base font-extrabold text-white shadow-xl"
                  style={{
                    background: "rgba(10,10,15,0.8)",
                    backdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Tag size={16} style={{ color: "var(--accent-orange)" }} />
                  {formatPrice(event.price)}
                </span>
              </div>

              {/* Remind me toggle button */}
              <button
                type="button"
                onClick={toggleReminder}
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-xl transition-all"
                style={{
                  background: event.isReminder
                    ? "var(--gradient-primary)"
                    : "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: event.isReminder ? "0 0 20px var(--accent-orange-glow)" : "none",
                }}
              >
                <Bell size={16} style={{ fill: event.isReminder ? "#fff" : "none" }} />
                <span>{event.isReminder ? "Reminder Active" : "Remind Me"}</span>
              </button>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-8 sm:p-10 space-y-6">
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {event.title}
            </h1>

            {/* Quick Meta Badges */}
            <div className="flex flex-wrap gap-3">
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
                style={{
                  background: "rgba(255,107,53,0.1)",
                  border: "1px solid rgba(255,107,53,0.2)",
                  color: "#ff8c5a",
                }}
              >
                <CalendarDays size={18} />
                <span>{formatDateTime(event.dateTime)}</span>
              </div>

              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
                style={{
                  background: "rgba(168,85,247,0.1)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  color: "#c084fc",
                }}
              >
                <MapPin size={18} />
                <span>{event.city}</span>
              </div>
            </div>

            {/* Event Description */}
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                About this Event
              </h2>
              <p
                className="text-base sm:text-lg leading-relaxed text-slate-300"
                style={{ whiteSpace: "pre-line" }}
              >
                {event.description}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Event Pass Designer */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "rgba(255,107,53,0.15)" }}
            >
              <Sparkles size={16} style={{ color: "var(--accent-orange)" }} />
            </span>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Personalize Card Pass
              </h2>
              <p className="text-xs text-slate-400">Style your collectible event pass</p>
            </div>
          </div>

          {/* Theme Palette */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Color Theme
            </p>
            <div className="flex flex-wrap gap-2.5">
              {themes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleThemeChange(item.value)}
                  className={`h-10 w-10 rounded-xl bg-linear-to-br ${item.className} transition-all duration-200`}
                  style={{
                    border: theme === item.value ? "3px solid #ffffff" : "2px solid transparent",
                    transform: theme === item.value ? "scale(1.12)" : "scale(1)",
                    boxShadow: theme === item.value ? "0 0 16px rgba(255,255,255,0.25)" : "none",
                  }}
                  title={item.label}
                  aria-label={item.label}
                />
              ))}
            </div>
          </div>

          {/* Stickers Tray */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Smile size={13} />
                Add Stickers ({selectedStickers.length}/3)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableStickers.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAddSticker(emoji)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-transform hover:scale-115"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--glass-border)",
                  }}
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Live Card Pass Preview */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Pass Preview
            </p>
            <div
              className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${selectedTheme.className} p-6 shadow-2xl transition-all duration-500`}
              style={{ border: "1px solid rgba(255,255,255,0.3)" }}
            >
              <div className="relative z-10 flex min-h-50 flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider opacity-85">
                  <span className={selectedTheme.textColor}>{event.city}</span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                    style={{ background: "rgba(0,0,0,0.15)", color: "inherit" }}
                  >
                    {event.category}
                  </span>
                </div>

                <div className="my-3">
                  <h3
                    className={`text-xl font-extrabold tracking-tight ${selectedTheme.textColor}`}
                  >
                    {event.title}
                  </h3>
                  <p className={`mt-1 text-xs font-medium opacity-80 ${selectedTheme.textColor}`}>
                    {formatDateTime(event.dateTime)}
                  </p>
                </div>

                {/* Stickers row */}
                <div className="flex min-h-10 items-center gap-2 text-2xl pt-2">
                  {selectedStickers.length === 0 ? (
                    <span className="text-xs opacity-60">Tap stickers above to decorate</span>
                  ) : (
                    selectedStickers.map((emoji, index) => (
                      <span
                        key={`${emoji}-${index}`}
                        className="animate-bounce"
                        style={{ animationDuration: `${1 + index * 0.2}s` }}
                      >
                        {emoji}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Remove Stickers List */}
          {selectedStickers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedStickers.map((emoji, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  type="button"
                  onClick={() => handleRemoveSticker(idx)}
                  className="rounded-lg px-2.5 py-1 text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-center gap-1"
                >
                  <span>{emoji}</span>
                  <span>✕</span>
                </button>
              ))}
            </div>
          )}

          {saving && <p className="text-xs text-slate-400">Saving customized pass...</p>}
        </div>
      </div>

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
