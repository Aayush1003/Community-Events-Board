"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";

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
    <div className="mx-auto max-w-md">
      <div className="glass-card rounded-2xl p-8 animate-fade-in-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
               style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', boxShadow: '0 0 30px rgba(100,116,139,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Shield size={24} className="text-white" />
          </div>
          <span className="section-label">Admin access</span>
          <h1 className="mt-2 text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Admin Login
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage events and community content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                   style={{ color: 'var(--text-muted)' }}>Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-3"
                    style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="form-input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                   style={{ color: 'var(--text-muted)' }}>Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-3"
                    style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="form-input pl-10"
              />
            </div>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          <button type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #1e293b, #334155)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(100,116,139,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            {loading ? "Checking credentials..." : "Admin login"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
