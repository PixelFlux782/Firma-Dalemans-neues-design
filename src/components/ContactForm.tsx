"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type FormStatus = { type: "success" | "error"; message: string } | null;
const contextKeys = ["produkt", "kategorie", "anliegen", "raum", "service"] as const;

export function ContactForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<FormStatus>(null);
  const [pending, setPending] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const initialSubject = useMemo(
    () =>
      contextKeys
        .map((key) => searchParams.get(key))
        .filter((value): value is string => Boolean(value))
        .join(" – ") || "Allgemeine Beratung",
    [searchParams],
  );

  useEffect(() => {
    if (status) statusRef.current?.focus();
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!email && !phone) {
      setStatus({ type: "error", message: "Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an." });
      window.requestAnimationFrame(() => emailRef.current?.focus());
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Die Anfrage konnte nicht gesendet werden.");
      setStatus({ type: "success", message: "Vielen Dank. Ihre Anfrage wurde übermittelt. Wir melden uns persönlich bei Ihnen." });
      form.reset();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Die Anfrage konnte nicht gesendet werden. Bitte nutzen Sie Telefon oder E-Mail.",
      });
    } finally {
      setPending(false);
    }
  }

  const inputClass = "form-input";

  return (
    <form onSubmit={handleSubmit} className="premium-card relative overflow-hidden p-7 md:p-9 lg:p-10">
      <p className="section-eyebrow">Anfrage</p>
      <h2 className="font-display mt-4 text-2xl font-medium text-premium-ink">Projekt beschreiben</h2>
      <p className="mt-3 text-sm leading-7 text-premium-muted">Kurz und konkret – ein bestimmtes Modell müssen Sie noch nicht kennen. Wir melden uns persönlich zu Ihrem Raum oder Produktwunsch.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-premium-charcoal">
          Vorname
          <span aria-hidden="true"> *</span>
          <input name="firstName" type="text" autoComplete="given-name" className={inputClass} maxLength={200} required />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal">
          Nachname
          <span aria-hidden="true"> *</span>
          <input name="lastName" type="text" autoComplete="family-name" className={inputClass} maxLength={200} required />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal">
          Gemeinde oder Organisation <span className="font-normal text-premium-muted">(optional)</span>
          <input name="organization" type="text" autoComplete="organization" className={inputClass} maxLength={200} />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal">
          E-Mail <span className="font-normal text-premium-muted">(E-Mail oder Telefon)</span>
          <input ref={emailRef} name="email" type="email" autoComplete="email" className={inputClass} maxLength={200} />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal">
          Telefon <span className="font-normal text-premium-muted">(E-Mail oder Telefon)</span>
          <input name="phone" type="tel" autoComplete="tel" className={inputClass} maxLength={200} />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal sm:col-span-2">
          Anliegen oder gewünschter Bereich
          <span aria-hidden="true"> *</span>
          <input name="subject" type="text" className={inputClass} defaultValue={initialSubject} maxLength={200} required />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal sm:col-span-2">
          Nachricht
          <span aria-hidden="true"> *</span>
          <textarea name="message" className={`${inputClass} min-h-[180px] resize-y`} minLength={10} maxLength={5000} required />
        </label>
        <label className="absolute -left-[9999px]" aria-hidden="true">
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" disabled={pending} className="btn-primary w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto">
            {pending ? "Wird gesendet …" : "Anfrage senden"}
          </button>
          <p className="mt-4 text-xs leading-6 text-premium-muted">
            Hinweise zur Verarbeitung finden Sie in unserer{" "}
            <a href="/datenschutz" className="underline underline-offset-4">Datenschutzerklärung</a>.
          </p>
        </div>
        {status ? (
          <p
            ref={statusRef}
            tabIndex={-1}
            role={status.type === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`sm:col-span-2 rounded-2xl border px-4 py-3.5 text-sm leading-7 ${
              status.type === "error" ? "border-red-700/30 bg-red-50 text-red-900" : "border-premium-sand/35 bg-premium-warm/60 text-premium-charcoal"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
