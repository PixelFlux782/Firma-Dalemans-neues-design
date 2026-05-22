"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setStatus(
      "Die Anfrage wurde als Demo erfasst. Der Versand kann im nächsten Schritt technisch angebunden werden.",
    );
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-premium-beige/80 bg-premium-canvas/50 px-4 py-3 text-sm text-premium-ink outline-none transition duration-300 placeholder:text-premium-subtle focus:border-premium-sand focus:bg-white focus:ring-2 focus:ring-premium-sand/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="premium-card p-6 md:p-8 lg:p-10"
    >
      <p className="section-eyebrow text-[0.65rem]">Anfrage</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-premium-ink">
        Projekt beschreiben
      </h2>
      <p className="mt-2 text-sm text-premium-muted">
        Kurz und konkret — wir melden uns mit einer passenden Einschätzung.
      </p>

      <div className="mt-8 grid gap-5">
        <div>
          <label
            className="block text-sm font-medium text-premium-charcoal"
            htmlFor="name"
          >
            Name / Gemeinde / Verein
          </label>
          <input
            id="name"
            type="text"
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
            placeholder="Optional für Rückfragen"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-premium-charcoal"
            htmlFor="message"
          >
            Ihre Anfrage
          </label>
          <textarea
            id="message"
            className={`${inputClass} min-h-[160px] resize-y`}
            placeholder="Beschreiben Sie kurz Raum, Nutzung und gewünschte Stühle oder Tische."
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full sm:w-auto">
          Anfrage senden
        </button>

        <p className="text-xs leading-6 text-premium-subtle">
          Hinweis: Das Formular ist aktuell als Frontend-Demo angelegt. Auf Wunsch
          binde ich im nächsten Schritt den echten Versand per E-Mail oder API an.
        </p>

        {status ? (
          <p className="rounded-2xl border border-premium-sand/30 bg-premium-warm/60 px-4 py-3 text-sm text-premium-charcoal">
            {status}
          </p>
        ) : null}
      </div>
    </form>
  );
}
