"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const categories = ["Music", "Workshop", "Food", "Sports", "Kids"];

export default function PreferencesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      const meResponse = await fetch("/api/auth/me", { credentials: "include" });
      if (!meResponse.ok) {
        router.push("/login");
        return;
      }

      const favouritesResponse = await fetch("/api/favourites", { credentials: "include" });
      const favourites = favouritesResponse.ok ? await favouritesResponse.json() : { categories: [] };
      setSelected(favourites.categories || []);
      setLoading(false);
    }

    void loadPreferences();
  }, [router]);

  function toggleCategory(category: string) {
    setSelected((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }

  async function savePreferences() {
    setSaving(true);
    const response = await fetch("/api/favourites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: selected }),
      credentials: "include",
    });

    setSaving(false);

    if (response.ok) {
      router.push("/my-feed");
    }
  }

  if (loading) {
    return <div className="text-center text-slate-600">Loading your preferences...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Personalize</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Choose your favourite categories</h1>
      <p className="mt-3 text-slate-600">Your My Feed will only show upcoming events from these categories.</p>

      <div className="mt-8 flex flex-wrap gap-3">
        {categories.map((category) => {
          const active = selected.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={savePreferences}
        disabled={saving}
        className="mt-8 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
      >
        {saving ? "Saving..." : "Save preferences"}
      </button>
    </div>
  );
}
