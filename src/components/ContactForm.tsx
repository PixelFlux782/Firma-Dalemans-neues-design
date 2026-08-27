"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type FormStatus = { type: "success" | "error"; message: string } | null;
type FormField = "firstName" | "lastName" | "organization" | "email" | "phone" | "subject" | "message";
type FormErrors = Partial<Record<FormField, string>>;

const contextKeys = ["produkt", "variante", "kategorie", "anliegen", "raum", "service"] as const;
const fieldOrder: FormField[] = ["firstName", "lastName", "organization", "email", "phone", "subject", "message"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFormValues(form: HTMLFormElement): Record<FormField, string> {
  const formData = new FormData(form);

  return {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    organization: String(formData.get("organization") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    subject: String(formData.get("subject") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };
}

function validateForm(form: HTMLFormElement): FormErrors {
  const values = getFormValues(form);
  const errors: FormErrors = {};

  if (!values.firstName) errors.firstName = "Bitte geben Sie Ihren Vornamen ein.";
  if (!values.lastName) errors.lastName = "Bitte geben Sie Ihren Nachnamen ein.";
  if (!values.email && !values.phone) {
    errors.email = "Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an.";
  } else if (values.email && !emailPattern.test(values.email)) {
    errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
  }
  if (!values.subject) errors.subject = "Bitte wählen Sie ein Anliegen aus.";
  if (!values.message) {
    errors.message = "Bitte geben Sie eine Nachricht ein.";
  } else if (values.message.length < 10) {
    errors.message = "Bitte beschreiben Sie Ihr Anliegen mit mindestens 10 Zeichen.";
  }

  return errors;
}

function FieldError({ field, errors }: { field: FormField; errors: FormErrors }) {
  const message = errors[field];
  if (!message) return null;

  return (
    <p id={`${field}-error`} role="alert" className="mt-2 text-sm leading-6 text-red-800">
      {message}
    </p>
  );
}

function errorAttributes(field: FormField, errors: FormErrors) {
  const hasError = Boolean(errors[field]);
  return {
    "aria-invalid": hasError,
    "aria-describedby": hasError ? `${field}-error` : undefined,
  } as const;
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<FormStatus>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [pending, setPending] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const initialSubject = useMemo(
    () =>
      contextKeys
        .map((key) => searchParams.get(key))
        .filter((value): value is string => Boolean(value))
        .join(" – ") || "Allgemeine Beratung",
    [searchParams],
  );
  const initialMessage = searchParams.get("nachricht") ?? "";

  useEffect(() => {
    if (status) statusRef.current?.focus();
  }, [status]);

  function handleFieldChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!hasAttemptedSubmit || !event.currentTarget.form) return;
    setErrors(validateForm(event.currentTarget.form));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const form = event.currentTarget;
    const nextErrors = validateForm(form);
    setHasAttemptedSubmit(true);
    setErrors(nextErrors);

    const firstInvalidField = fieldOrder.find((field) => nextErrors[field]);
    if (firstInvalidField) {
      window.requestAnimationFrame(() => {
        const field = form.elements.namedItem(firstInvalidField);
        if (field instanceof HTMLElement) field.focus();
      });
      return;
    }

    const formData = new FormData(form);
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
      setErrors({});
      setHasAttemptedSubmit(false);
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
    <form noValidate onSubmit={handleSubmit} className="premium-card relative overflow-hidden p-7 md:p-9 lg:p-10">
      <p className="section-eyebrow">Anfrage</p>
      <h2 className="font-display mt-4 text-2xl font-medium text-premium-ink">Projekt beschreiben</h2>
      <p className="mt-3 text-sm leading-7 text-premium-muted">Kurz und konkret – ein bestimmtes Modell müssen Sie noch nicht kennen. Wir melden uns persönlich zu Ihrem Raum oder Produktwunsch.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-premium-charcoal">
          Vorname
          <span aria-hidden="true"> *</span>
          <input name="firstName" type="text" autoComplete="given-name" className={inputClass} maxLength={200} required onChange={handleFieldChange} {...errorAttributes("firstName", errors)} />
          <FieldError field="firstName" errors={errors} />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal">
          Nachname
          <span aria-hidden="true"> *</span>
          <input name="lastName" type="text" autoComplete="family-name" className={inputClass} maxLength={200} required onChange={handleFieldChange} {...errorAttributes("lastName", errors)} />
          <FieldError field="lastName" errors={errors} />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal">
          Gemeinde oder Organisation <span className="font-normal text-premium-muted">(optional)</span>
          <input name="organization" type="text" autoComplete="organization" className={inputClass} maxLength={200} />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal">
          E-Mail <span className="font-normal text-premium-muted">(E-Mail oder Telefon)</span>
          <input name="email" type="email" autoComplete="email" className={inputClass} maxLength={200} onChange={handleFieldChange} {...errorAttributes("email", errors)} />
          <FieldError field="email" errors={errors} />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal">
          Telefon <span className="font-normal text-premium-muted">(E-Mail oder Telefon)</span>
          <input name="phone" type="tel" autoComplete="tel" className={inputClass} maxLength={200} onChange={handleFieldChange} />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal sm:col-span-2">
          Anliegen oder gewünschter Bereich
          <span aria-hidden="true"> *</span>
          <input name="subject" type="text" className={inputClass} defaultValue={initialSubject} maxLength={200} required onChange={handleFieldChange} {...errorAttributes("subject", errors)} />
          <FieldError field="subject" errors={errors} />
        </label>
        <label className="block text-sm font-medium text-premium-charcoal sm:col-span-2">
          Nachricht
          <span aria-hidden="true"> *</span>
          <textarea name="message" className={`${inputClass} min-h-[180px] resize-y`} defaultValue={initialMessage} minLength={10} maxLength={5000} required onChange={handleFieldChange} {...errorAttributes("message", errors)} />
          <FieldError field="message" errors={errors} />
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
