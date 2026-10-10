"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Heart,
  Check,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

const categories = ["Music", "Workshop", "Food", "Sports", "Kids"];

const categoryMeta: Record<
  string,
  { emoji: string; desc: string; color: string; border: string; glow: string }
> = {
  Music: {
    emoji: "🎵",
    desc: "Concerts, gigs & live sessions",
    color: "rgba(168,85,247,0.15)",
    border: "rgba(168,85,247,0.35)",
    glow: "rgba(168,85,247,0.25)",
  },
  Workshop: {
    emoji: "🛠",
    desc: "Crafts, design & tech masterclasses",
    color: "rgba(255,107,53,0.15)",
    border: "rgba(255,107,53,0.35)",
    glow: "rgba(255,107,53,0.25)",
  },
  Food: {
    emoji: "🍕",
    desc: "Festivals, popups & tastings",
    color: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.35)",
    glow: "rgba(239,68,68,0.25)",
  },
  Sports: {
    emoji: "⚽",
    desc: "Runs, tournaments & fitness",
    color: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.35)",
    glow: "rgba(16,185,129,0.25)",
  },
  Kids: {
    emoji: "🧒",
    desc: "Family, magic shows & fun activities",
    color: "rgba(6,182,212,0.15)",
    border: "rgba(6,182,212,0.35)",
    glow: "rgba(6,182,212,0.25)",
  },
};

export default function PreferencesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((c) => (c === msg ? null : c)), 3000);
  }

  useEffect(() => {
    async function loadPreferences() {
      try {
        const meResponse = await fetch("/api/auth/me", { credentials: "include" });
        if (!meResponse.ok) {
          router.push("/login");
          return;
        }

        const favouritesResponse = await fetch("/api/favourites", {
          credentials: "include",
        });
        const favourites = favouritesResponse.ok
          ? await favouritesResponse.json()
          : { categories: [] };
        setSelected(favourites.categories || []);
        setLoading(false);
      } catch {
        router.push("/login");
      }
    }

    void loadPreferences();
  }, [router]);

  function toggleCategory(category: string) {
    setSelected((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  function selectAll() {
    setSelected([...categories]);
  }

  function clearAll() {
    setSelected([]);
  }

  async function savePreferences() {
    setSaving(true);
    try {
      const response = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: selected }),
        credentials: "include",
      });

      setSaving(false);

      if (response.ok) {
        showToast("Preferences saved!");
        router.push("/my-feed");
      } else {
        showToast("Could not save preferences.");
      }
    } catch {
      setSaving(false);
      showToast("Error updating preferences.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="shimmer h-96 w-full max-w-2xl rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="glass-card rounded-3xl p-8 sm:p-12 animate-fade-in-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #ff6b35, #ec4899)",
              boxShadow: "0 0 35px rgba(255,107,53,0.3)",
            }}
          >
            <Heart size={28} className="text-white" />
          </div>
          <span className="section-label">Personalize Your Feed</span>
          <h1
            className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Pick Your Favourites
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Choose what you enjoy most. Your personal <strong>My Feed</strong> will dynamically surface events tailored to your selections.
          </p>

          {/* Quick toggle actions */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-rose-300 hover:text-rose-200 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Reset
            </button>
            <span className="text-xs text-slate-400 font-medium ml-2">
              <strong>{selected.length}</strong> of {categories.length} selected
            </span>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category) => {
            const active = selected.includes(category);
            const meta = categoryMeta[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className="group relative flex flex-col items-start rounded-2xl p-5 text-left transition-all duration-300 cursor-pointer"
                style={{
                  background: active ? meta.color : "rgba(255,255,255,0.03)",
                  border: active
                    ? `2px solid ${meta.border}`
                    : "1px solid var(--glass-border)",
                  boxShadow: active ? `0 0 25px ${meta.glow}` : "none",
                  transform: active ? "translateY(-2px)" : "none",
                }}
              >
                {/* Active check icon badge */}
                <div className="flex w-full items-center justify-between mb-3">
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-115">
                    {meta.emoji}
                  </span>
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full transition-all"
                    style={{
                      background: active ? "var(--gradient-primary)" : "rgba(255,255,255,0.05)",
                      border: active ? "none" : "1px solid var(--glass-border)",
                    }}
                  >
                    {active && <Check size={14} className="text-white" />}
                  </div>
                </div>

                <span
                  className="text-base font-bold transition-colors"
                  style={{
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  {category}
                </span>
                <span className="mt-1 text-xs text-slate-400 leading-snug">
                  {meta.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <Link
            href="/my-feed"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Skip to My Feed
          </Link>

          <button
            type="button"
            onClick={savePreferences}
            disabled={saving}
            className="btn-primary w-full sm:w-auto px-8 py-3 text-sm font-bold flex items-center justify-center gap-2"
          >
            <span>{saving ? "Saving preferences..." : "Save Preferences"}</span>
            <ArrowRight size={16} />
          </button>
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
