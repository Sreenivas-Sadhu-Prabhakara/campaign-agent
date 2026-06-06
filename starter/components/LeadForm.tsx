"use client";

import { useState } from "react";

type State = "idle" | "loading" | "done" | "error";

export default function LeadForm({ source = "homepage" }: { source?: string }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      website: form.get("website"), // honeypot — bots fill this
      source,
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setState("done");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        setState("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-800">You&apos;re in! 🎉</p>
        <p className="mt-1 text-emerald-700">Check your inbox (or WhatsApp) for your guide.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        name="name"
        placeholder="Your name"
        autoComplete="name"
        className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-orange-600"
      />
      <input
        name="email"
        type="email"
        placeholder="you@email.com"
        autoComplete="email"
        className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-orange-600"
      />
      <input
        name="phone"
        type="tel"
        placeholder="WhatsApp number (optional, e.g. +1...)"
        autoComplete="tel"
        className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-orange-600"
      />
      {/* Honeypot: hidden from humans, tempting to bots */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-lg bg-orange-700 px-4 py-3 font-semibold text-white transition hover:bg-orange-800 disabled:opacity-60"
      >
        {state === "loading" ? "Sending…" : "Send me the guide →"}
      </button>
      {state === "error" && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-center text-xs text-stone-500">No spam. Unsubscribe anytime.</p>
    </form>
  );
}
