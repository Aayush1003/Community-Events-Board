"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "admin@community.com", password: "admin123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Admin login failed.");
      return;
    }

    router.push("/admin/events");
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Admin access</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Login</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-orange-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-orange-400"
          />
        </div>

        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Checking credentials..." : "Admin login"}
        </button>
      </form>
    </div>
  );
}
