"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setStatus(
      "Vielen Dank — Ihre Anfrage ist bei uns eingegangen. Wir melden uns zeitnah mit einer ersten Einschätzung.",
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="premium-card relative overflow-hidden p-7 md:p-9 lg:p-10"
    >
      <span
        className="mb-5 block h-px w-10 bg-gradient-to-r from-premium-bronze/50 to-transparent"
        aria-hidden
      />
      <p className="section-eyebrow">Anfrage</p>
      <h2 className="font-display mt-4 text-2xl font-medium tracking-[-0.02em] text-premium-ink md:text-[1.75rem]">
        Projekt beschreiben
      </h2>
      <p className="mt-3 text-sm leading-[1.75] text-premium-muted">
        Kurz und konkret — wir melden uns mit einer passenden Einschätzung für
        Ihren Raum.
      </p>

      <div className="mt-9 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            className="block text-sm font-medium text-premium-charcoal"
            htmlFor="name"
          >
            Name / Gemeinde / Verein
          </label>
          <input
            id="name"
            type="text"
            className="form-input"
            placeholder="z. B. Freikirche Musterstadt"
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-premium-charcoal"
            htmlFor="email"
          >
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="name@beispiel.de"
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-premium-charcoal"
            htmlFor="phone"
          >
            Telefon
          </label>
          <input
            id="phone"
            type="tel"
            className="form-input"
            placeholder="Optional für Rückfragen"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            className="block text-sm font-medium text-premium-charcoal"
            htmlFor="message"
          >
            Ihre Anfrage
          </label>
          <textarea
            id="message"
            className="form-input min-h-[180px] resize-y"
            placeholder="Beschreiben Sie kurz Raum, Nutzung und gewünschte Stühle oder Tische."
            required
          />
        </div>

        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary w-full sm:w-auto">
            Anfrage senden
          </button>
        </div>

        {status ? (
          <p
            role="status"
            aria-live="polite"
            className="sm:col-span-2 rounded-2xl border border-premium-sand/35 bg-premium-warm/60 px-4 py-3.5 text-sm leading-[1.75] text-premium-charcoal"
          >
            {status}
          </p>
        ) : null}
      </div>
    </form>
  );
}
