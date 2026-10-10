"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { UserPlus, User, Mail, Lock, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Unable to create account.");
      return;
    }

    router.push("/preferences");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="glass-card rounded-2xl p-8 animate-fade-in-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
               style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', boxShadow: '0 0 30px var(--accent-purple-glow)' }}>
            <UserPlus size={24} className="text-white" />
          </div>
          <span className="section-label">Join us</span>
          <h1 className="mt-2 text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Create account
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Get personalized event recommendations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                   style={{ color: 'var(--text-muted)' }}>Full name</label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3.5 top-3"
                    style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="form-input pl-10"
                placeholder="John Doe"
              />
            </div>
          </div>

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
                placeholder="you@example.com"
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
                minLength={6}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="form-input pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Sign up"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold gradient-text">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
