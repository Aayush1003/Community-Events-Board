"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, MapPin, Tag, Sparkles } from "lucide-react";
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
  { label: "Sunset glow", value: "sunset", className: "from-orange-300 via-pink-300 to-rose-200" },
  { label: "Ocean calm", value: "ocean", className: "from-cyan-200 via-sky-200 to-indigo-200" },
  { label: "Forest light", value: "forest", className: "from-emerald-200 via-lime-200 to-yellow-100" },
];

const stickers = ["🎉", "🎵", "🌟", "✨", "🎈"];

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [theme, setTheme] = useState("sunset");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Event not found");
        setLoading(false);
        return;
      }

      setEvent(data);
      setTheme(data.cardDesign?.theme || "sunset");
      setSelectedStickers(data.cardDesign?.stickers || []);
      setLoading(false);
    }

    void loadEvent();
  }, [params.id]);

  async function saveDesign(nextTheme: string, nextStickers: string[]) {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    if (!id) {
      return;
    }

    setSaving(true);
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
      setError("Please log in to save your card design.");
    }
  }

  function handleThemeChange(nextTheme: string) {
    setTheme(nextTheme);
    void saveDesign(nextTheme, selectedStickers);
  }

  function handleAddSticker(emoji: string) {
    if (selectedStickers.length >= 3) {
      return;
    }

    const next = [...selectedStickers, emoji];
    setSelectedStickers(next);
    void saveDesign(theme, next);
  }

  function handleRemoveSticker(emoji: string) {
    const next = selectedStickers.filter((item) => item !== emoji);
    setSelectedStickers(next);
    void saveDesign(theme, next);
  }

  if (loading) {
    return <div className="text-center text-slate-600">Loading event...</div>;
  }

  if (!event) {
    return <div className="rounded-2xl bg-red-50 p-6 text-red-700">{error || "Event not found."}</div>;
  }

  const selectedTheme = themes.find((item) => item.value === theme) || themes[0];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <img src={event.imageUrl} alt={event.title} className="h-80 w-full object-cover" />
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                {event.category}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {event.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>

            <div className="mt-4 space-y-3 text-slate-600">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} />
                <span>{formatDateTime(event.dateTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{event.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={18} />
                <span>{formatPrice(event.price)}</span>
              </div>
            </div>

            <p className="mt-6 text-base leading-7 text-slate-700">{event.description}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-orange-600">
            <Sparkles size={18} />
            <h2 className="text-xl font-bold text-slate-900">Design your card</h2>
          </div>

          <div className="mb-5">
            <p className="mb-3 text-sm font-medium text-slate-700">Background theme</p>
            <div className="flex flex-wrap gap-2">
              {themes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleThemeChange(item.value)}
                  className={`h-10 w-10 rounded-full border-2 ${
                    theme === item.value ? "border-slate-900" : "border-white"
                  } bg-gradient-to-br ${item.className}`}
                  aria-label={item.label}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">Add stickers</p>
            <div className="flex flex-wrap gap-2">
              {stickers.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAddSticker(emoji)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl transition hover:border-slate-300"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-slate-700">Your live card</p>
            <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${selectedTheme.className} p-5 transition-all duration-300`}>
              <div className="absolute inset-0 bg-white/10" />
              <div className="relative z-10 flex min-h-[180px] flex-col justify-between">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>{event.city}</span>
                  <span>{event.category}</span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{event.title}</h3>
                  <p className="mt-2 text-sm text-slate-700">{formatDateTime(event.dateTime)}</p>
                </div>

                <div className="flex min-h-[48px] items-end gap-2 text-2xl">
                  {selectedStickers.map((emoji, index) => (
                    <span key={`${emoji}-${index}`} className="animate-bounce">{emoji}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {selectedStickers.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {selectedStickers.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() => handleRemoveSticker(emoji)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm"
                >
                  {emoji} Remove
                </button>
              ))}
            </div>
          ) : null}

          {saving ? <p className="mt-4 text-sm text-slate-500">Saving design...</p> : null}
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
